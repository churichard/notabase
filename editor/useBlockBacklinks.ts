import { useMemo } from 'react';
import { createEditor, Editor, Element, Descendant } from 'slate';
import type { Notes } from 'lib/store';
import { useStore, deepEqual } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { ElementType } from 'types/slate';
import { Backlink, BacklinkMatch } from './useBacklinks';

const DEBOUNCE_MS = 1000;

type ReturnType = {
  blockBacklinks: Backlink[];
};

export default function useBlockBacklinks(blockId: string | null) {
  const [notes] = useDebounce(
    useStore((state) => state.notes, deepEqual),
    DEBOUNCE_MS
  );

  const state = useMemo(() => {
    const state = {};
    // Backlinks are not computed until they are retrieved
    Object.defineProperties(state, {
      blockBacklinks: {
        get: () => computeBlockBacklinks(notes, blockId),
        enumerable: true,
      },
    });
    return state as ReturnType;
  }, [notes, blockId]);

  return state;
}

/**
 * Searches the notes array for block matches to the given blockId
 * and returns an array of the matches.
 */
const computeBlockBacklinks = (notes: Notes, blockId: string | null) => {
  if (blockId === null) {
    return [];
  }

  const result: Backlink[] = [];
  for (const note of Object.values(notes)) {
    const matches = computeBlockMatches(note.content, blockId);
    if (matches.length > 0) {
      result.push({
        id: note.id,
        title: note.title,
        matches,
      });
    }
  }
  return result;
};

const computeBlockMatches = (nodes: Descendant[], blockId: string) => {
  const editor = createEditor();
  editor.children = nodes;

  // Find block references that have the given blockId
  const matchingElements = Editor.nodes<Element>(editor, {
    at: [],
    match: (n) =>
      Element.isElement(n) &&
      n.type === ElementType.BlockReference &&
      n.blockId === blockId,
  });

  const result: BacklinkMatch[] = [];
  for (const [block, path] of matchingElements) {
    result.push({ lineElement: block, linePath: path, path });
  }
  return result;
};
