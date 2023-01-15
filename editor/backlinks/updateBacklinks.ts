import { Element, Editor, Transforms } from 'slate';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import { store } from 'lib/store';
import updateNote from 'lib/api/updateNote';
import { getActiveOrTempEditor } from 'lib/activeEditorsStore';
import { computeLinkedBacklinks } from './useBacklinks';

/**
 * Updates the link properties of the backlinks on each backlinked note when the
 * current note title has changed.
 */
const updateBacklinks = async (newTitle: string, noteId: string) => {
  const notes = store.getState().notes;
  const backlinks = computeLinkedBacklinks(notes, noteId);
  const updateData: Pick<Note, 'id' | 'content'>[] = [];

  for (const backlink of backlinks) {
    const note = notes[backlink.id];

    if (!note) {
      continue;
    }

    const editor = getActiveOrTempEditor(backlink.id, note.content);

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
