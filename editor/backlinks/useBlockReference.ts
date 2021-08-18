import { useMemo, useRef } from 'react';
import { createEditor, Editor, Element, Path } from 'slate';
import type { Notes } from 'lib/store';
import { useStore, deepEqual } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { Note } from 'types/supabase';
import { isReferenceableBlockElement } from '../plugins/withBlockReferences';

const DEBOUNCE_MS = 500;

export type BlockReference = {
  noteId: string;
  element: Element;
  path: Path;
};

export default function useBlockReference(blockId: string) {
  const [notes] = useDebounce(
    useStore((state) => state.notes, deepEqual),
    DEBOUNCE_MS
  );
  const cachedPath = useRef<{ noteId: string; path: Path } | null>(null);

  /**
   * Searches the notes array for the specific block reference and returns it.
   */
  const blockReference = useMemo(() => {
    // If there is a cached note id + path, search that path + note for the block id
    if (cachedPath.current) {
      const note = notes[cachedPath.current.noteId];
      // Search path first, then search note
      const blockRef =
        getBlockReferenceFromPath(blockId, note, cachedPath.current.path) ||
        getBlockReferenceFromNote(blockId, note);
      if (blockRef) {
        // Path could potentially have changed, so update cache
        cachedPath.current = { noteId: blockRef.noteId, path: blockRef.path };
        return blockRef;
      }
    }
    // Compute block reference and cache the note id + path
    const blockRef = computeBlockReference(notes, blockId);
    cachedPath.current = blockRef
      ? { noteId: blockRef.noteId, path: blockRef.path }
      : null;
    return blockRef;
  }, [notes, blockId]);

  return blockReference;
}

/**
 * Searches the notes array for the specific block reference and returns it.
 */
export const computeBlockReference = (
  notes: Notes,
  blockId: string
): BlockReference | null => {
  for (const note of Object.values(notes)) {
    const blockRef = getBlockReferenceFromNote(blockId, note);
    if (blockRef) {
      return blockRef;
    }
  }
  return null;
};

const getBlockReferenceFromNote = (blockId: string, note: Note) => {
  const editor = createEditor();
  editor.children = note.content;

  // Find element that matches the block id
  const matchingElements = Editor.nodes<Element>(editor, {
    at: [],
    match: (n) =>
      Element.isElement(n) &&
      Editor.isBlock(editor, n) &&
      isReferenceableBlockElement(n) &&
      n.id === blockId,
  });

  for (const [element, path] of matchingElements) {
    return { noteId: note.id, element, path };
  }

  return null;
};

const getBlockReferenceFromPath = (
  blockId: string,
  note: Note,
  path: Path
): BlockReference | null => {
  const editor = createEditor();
  editor.children = note.content;

  const [element] = Editor.node(editor, path);

  if (
    Element.isElement(element) &&
    Editor.isBlock(editor, element) &&
    isReferenceableBlockElement(element) &&
    element.id === blockId
  ) {
    return { noteId: note.id, element, path };
  }

  return null;
};
