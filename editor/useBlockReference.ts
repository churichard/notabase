import { useCallback, useRef } from 'react';
import { createEditor, Editor, Element, Path } from 'slate';
import type { Notes } from 'lib/store';
import { useStore, deepEqual } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { Note } from 'types/supabase';
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
  const cachedNoteIdRef = useRef<string | null>(null);

  /**
   * Searches the notes array for the specific block reference and returns it.
   */
  const computeBlockReference = useCallback(
    (notes: Notes, blockId: string): BlockReference | null => {
      for (const note of Object.values(notes)) {
        const blockRef = getBlockReference(blockId, note);
        if (blockRef) {
          cachedNoteIdRef.current = note.id; // Cache the note id
          return blockRef;
        }
      }
      cachedNoteIdRef.current = null; // Clear the note id
      return null;
    },
    []
  );

  /**
   * If there is a cached note id, search that note for the block id
   */
  if (cachedNoteIdRef.current) {
    const note = notes[cachedNoteIdRef.current];
    const blockRef = getBlockReference(blockId, note);
    if (blockRef) {
      return blockRef;
    }
  }

  return computeBlockReference(notes, blockId);
}

const getBlockReference = (blockId: string, note: Note) => {
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

  return null;
};
