import { Element, Editor, Transforms } from 'slate';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import { store } from 'lib/store';
import updateNote from 'lib/api/updateNote';
import loadNotesContent from 'lib/api/loadNotesContent';
import loadBacklinkIndex from 'lib/api/loadBacklinkIndex';
import { getActiveOrTempEditor } from 'lib/activeEditorsStore';
import { computeLinkedBacklinks } from './useBacklinks';

/**
 * Updates the link properties of the backlinks on each backlinked note when the
 * current note title has changed.
 */
const updateBacklinks = async (newTitle: string, noteId: string) => {
  await loadBacklinkIndex();
  const backlinkNotes = store.getState().backlinkNotes;
  const backlinks = computeLinkedBacklinks(backlinkNotes, noteId);
  const backlinkIds = backlinks.map((backlink) => backlink.id);
  if (backlinkIds.length === 0) return;
  const contents = await loadNotesContent(backlinkIds);
  const updateData: Pick<Note, 'id' | 'content'>[] = [];

  for (const backlink of backlinks) {
    const note = backlinkNotes[backlink.id];
    const content = contents.get(backlink.id);

    if (!note || !content) {
      continue;
    }

    const editor = getActiveOrTempEditor(backlink.id, content);

    Transforms.setNodes(
      editor,
      { noteTitle: newTitle, children: [{ text: newTitle }] },
      {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === ElementType.NoteLink &&
          n.noteId === noteId,
        voids: true,
      }
    );

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
    promises.push(updateNote(data));
  }
  await Promise.all(promises);
};

export default updateBacklinks;
