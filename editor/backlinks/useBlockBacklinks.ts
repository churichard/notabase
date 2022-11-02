import { useEffect } from 'react';
import { createEditor, Editor, Element } from 'slate';
import { Notes, useStore } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { BlockReference, ElementType } from 'types/slate';
import { Backlink, BacklinkType } from './useBacklinks';

const DEBOUNCE_MS = 1000;

export default function useBlockBacklinks() {
  const [notes] = useDebounce(
    useStore((state) => state.notes),
    DEBOUNCE_MS
  );

  const setBlockIdToBacklinksMap = useStore(
    (state) => state.setBlockIdToBacklinksMap
  );

  useEffect(() => {
    setBlockIdToBacklinksMap(computeBlockBacklinks(notes));
  }, [notes, setBlockIdToBacklinksMap]);
}

/**
 * Computes a map of block id to backlinks for the given notes.
 */
export const computeBlockBacklinks = (notes: Notes) => {
  // Map of blockId to array of backlinks.
  // We explicitly write undefined in the value because we don't populate every block id
  // in this map.
  const blockIdToBacklinksMap: Record<string, Backlink[] | undefined> = {};

  for (const note of Object.values(notes)) {
    const editor = createEditor();
    editor.children = note.content;

    const blockReferences = Editor.nodes<BlockReference>(editor, {
      at: [],
      match: (n) =>
        Element.isElement(n) && n.type === ElementType.BlockReference,
    });

    for (const [blockRef, path] of blockReferences) {
      const originalBlockId = blockRef.blockId;

      // Create record for this block id if it doesn't exist
      let blockBacklinks = blockIdToBacklinksMap[originalBlockId];
      if (!blockBacklinks) {
        const newBacklinks: Backlink[] = [];
        blockIdToBacklinksMap[originalBlockId] = newBacklinks;
        blockBacklinks = newBacklinks;
      }

      const newMatch = {
        lineElement: blockRef,
        linePath: path,
        path,
      };

      const blockNoteBacklinks = blockBacklinks.find(
        (backlink) => backlink.id === note.id
      );

      if (blockNoteBacklinks) {
        blockNoteBacklinks.matches.push(newMatch);
      } else {
        blockBacklinks.push({
          id: note.id,
          type: BacklinkType.Block,
          title: note.title,
          matches: [newMatch],
        });
      }
    }
  }

  return blockIdToBacklinksMap;
};
