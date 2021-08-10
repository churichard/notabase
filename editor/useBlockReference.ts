import { createEditor, Editor, Element, Path } from 'slate';
import type { Notes } from 'lib/store';
import { useStore, deepEqual } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { isElementWithBlockId } from './blockReferences';

const DEBOUNCE_MS = 500;

export type BlockReference = {
  element: Element;
  path: Path;
};

export default function useBlockReference(blockId: string) {
  const [notes] = useDebounce(
    useStore((state) => state.notes, deepEqual),
    DEBOUNCE_MS
  );

  return computeBlockReference(notes, blockId);
}

/**
 * Searches the notes array for the specific block reference and returns it.
 */
const computeBlockReference = (
  notes: Notes,
  blockId: string
): BlockReference | null => {
  for (const note of Object.values(notes)) {
    const editor = createEditor();
    editor.children = note.content;

    // Find element that matches the block id
    const matchingElements = Editor.nodes(editor, {
      at: [],
      match: (n) =>
        Element.isElement(n) &&
        Editor.isBlock(editor, n) &&
        isElementWithBlockId(n) &&
        n.id === blockId,
    });

    for (const [element, path] of matchingElements) {
      return { element: element as Element, path };
    }
  }
  return null;
};
