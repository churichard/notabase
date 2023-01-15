import { Editor, Element, Transforms } from 'slate';
import { Note } from 'types/supabase';
import supabase from 'lib/supabase';
import { store } from 'lib/store';
import { getActiveOrTempEditor } from 'lib/activeEditorsStore';
import { ElementType } from 'types/slate';
import { Backlink } from './useBacklinks';

/**
 * Updates the block text for each block reference. This is necessary for
 * full-text search.
 */
const updateBlockBacklinks = async (
  blockBacklinks: Backlink[],
  newText: string
) => {
  const notes = store.getState().notes;
  const updateData: Pick<Note, 'id' | 'content'>[] = [];

  for (const backlink of blockBacklinks) {
    const note = notes[backlink.id];

    if (!note) {
      continue;
    }

    const editor = getActiveOrTempEditor(backlink.id, note.content);

    Transforms.setNodes(
      editor,
      { children: [{ text: newText }] },
      {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === ElementType.BlockReference &&
          n.blockId === backlink.id,
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
    promises.push(
      supabase
        .from<Note>('notes')
        .update({ content: data.content })
        .eq('id', data.id)
    );
  }
  await Promise.all(promises);
};

export default updateBlockBacklinks;
