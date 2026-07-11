import { Editor, Element, Transforms } from 'slate';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import supabase from 'lib/supabase';
import { store } from 'lib/store';
import { getActiveOrTempEditor } from 'lib/activeEditorsStore';
import loadNotesContent from 'lib/api/loadNotesContent';
import loadBacklinkIndex from 'lib/api/loadBacklinkIndex';
import { computeLinkedBacklinks } from './useBacklinks';

/**
 * Deletes the backlinks on each backlinked note and replaces them with the link text.
 */
const deleteBacklinks = async (noteId: string) => {
  await loadBacklinkIndex();
  const notes = store.getState().backlinkNotes;
  const backlinks = computeLinkedBacklinks(notes, noteId);
  const contents = await loadNotesContent(
    backlinks.map((backlink) => backlink.id)
  );
  const updateData: Pick<Note, 'id' | 'content'>[] = [];

  for (const backlink of backlinks) {
    const note = notes[backlink.id];

    const content = contents.get(backlink.id);
    if (!note || !content) {
      continue;
    }

    const editor = getActiveOrTempEditor(backlink.id, content);

    Transforms.unwrapNodes(editor, {
      at: [],
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        n.type === ElementType.NoteLink &&
        n.noteId === noteId,
      voids: true,
    });

    updateData.push({
      id: backlink.id,
      content: editor.children,
    });
  }

  // Make sure backlinks are updated locally
  for (const newNote of updateData) {
    store.getState().updateNote(newNote);
  }

  // It would be better if we could consolidate the update requests into one request
  // See https://github.com/supabase/supabase-js/issues/156
  const promises = [];
  for (const data of updateData) {
    promises.push(
      supabase
        .from('notes')
        .update({ content: data.content, updated_at: new Date().toISOString() })
        .eq('id', data.id)
    );
  }
  await Promise.all(promises);
};

export default deleteBacklinks;
