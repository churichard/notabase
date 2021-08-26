import { useMemo } from 'react';
import { createEditor, Editor, Element, Descendant } from 'slate';
import type { Notes } from 'lib/store';
import { useStore, deepEqual } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { ElementType } from 'types/slate';
import { Backlink, BacklinkMatch } from './useBacklinks';

const DEBOUNCE_MS = 1000;

export default function useBlockBacklinks(blockId: string | null) {
  const [notes] = useDebounce(
    useStore((state) => state.notes, deepEqual),
    DEBOUNCE_MS
  );
  return useMemo(() => computeBlockBacklinks(notes, blockId), [notes, blockId]);
}

/**
 * Searches the notes array for block matches to the given blockId
 * and returns an array of the matches.
 */
export const computeBlockBacklinks = (notes: Notes, blockId: string | null) => {
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
