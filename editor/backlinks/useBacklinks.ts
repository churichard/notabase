import { useMemo } from 'react';
import {
  createEditor,
  Editor,
  Element,
  Node,
  Descendant,
  Path,
  Text,
} from 'slate';
import { ElementType, FormattedText } from 'types/slate';
import type { Notes } from 'lib/store';
import { useStore } from 'lib/store';
import useDebounce from 'utils/useDebounce';
import { caseInsensitiveStringEqual } from 'utils/string';

const DEBOUNCE_MS = 1000;

export type BacklinkMatch = {
  lineElement: Element;
  linePath: Path;
  path: Path;
};

export type Backlink = {
  id: string;
  title: string;
  matches: Array<BacklinkMatch>;
};

export default function useBacklinks(noteId: string) {
  const [notes] = useDebounce(
    useStore((state) => state.notes),
    DEBOUNCE_MS
  );

  const linkedBacklinks = useMemo(
    () => computeLinkedBacklinks(notes, noteId),
    [notes, noteId]
  );

  const unlinkedBacklinks = useMemo(
    () => computeUnlinkedBacklinks(notes, notes[noteId].title),
    [notes, noteId]
  );

  return { linkedBacklinks, unlinkedBacklinks };
}

/**
 * Searches the notes array for note links to the given noteId
 * and returns an array of the matches.
 */
export const computeLinkedBacklinks = (
  notes: Notes,
  noteId: string
): Backlink[] => {
  const result: Backlink[] = [];
  for (const note of Object.values(notes)) {
    const matches = computeLinkedMatches(note.content, noteId);
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

/**
 * Searches the notes array for text matches to the given noteTitle
 * and returns an array of the matches.
 */
const computeUnlinkedBacklinks = (
  notes: Notes,
  noteTitle: string | undefined
): Backlink[] => {
  if (!noteTitle) {
    return [];
  }

  const result: Backlink[] = [];
  for (const note of Object.values(notes)) {
    if (caseInsensitiveStringEqual(note.title, noteTitle)) {
      // We skip getting unlinked backlinks if the note titles are the same
      continue;
    }
    const matches = computeUnlinkedMatches(note.content, noteTitle);
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

const computeLinkedMatches = (nodes: Descendant[], noteId: string) => {
  const editor = createEditor();
  editor.children = nodes;

  // Find note link elements that match noteId
  const matchingElements = Editor.nodes(editor, {
    at: [],
    match: (n) =>
      Element.isElement(n) &&
      n.type === ElementType.NoteLink &&
      n.noteId === noteId &&
      !!Node.string(n), // We ignore note links with empty link text
  });

  const result: BacklinkMatch[] = [];
  for (const [, path] of matchingElements) {
    // Get the line element
    const block = Editor.above<Element>(editor, {
      at: path,
      match: (n) => Editor.isBlock(editor, n),
    });

    if (block) {
      const [lineElement, linePath] = block;
      result.push({ lineElement, linePath, path });
    }
  }
  return result;
};

const computeUnlinkedMatches = (nodes: Descendant[], noteTitle: string) => {
  const editor = createEditor();
  editor.children = nodes;

  // Find leaves that have noteTitle in them
  const matchingLeaves = Editor.nodes<FormattedText>(editor, {
    at: [],
    match: (n) =>
      Text.isText(n) && n.text.toLowerCase().includes(noteTitle.toLowerCase()),
  });

  const result: BacklinkMatch[] = [];
  for (const [node, path] of matchingLeaves) {
    // Skip matches that are part of a note link (those are linked matches)
    const [parent] = Editor.parent(editor, path);
    if (Element.isElement(parent) && parent.type === ElementType.NoteLink) {
      continue;
    }

    // Get the line element
    const block = Editor.above<Element>(editor, {
      at: path,
      match: (n) => Editor.isBlock(editor, n),
    });

    if (block) {
      const [lineElement, linePath] = block;
      // We calculate the number of matches in the string and push for each one
      // This ensures that the calculated number of unlinked matches is accurate
      const re = new RegExp(noteTitle.toLowerCase(), 'g');
      const numOfMatches = (node.text.toLowerCase().match(re) ?? []).length;
      for (let i = 0; i < numOfMatches; i++) {
        result.push({ lineElement, linePath, path });
      }
    }
  }
  return result;
};
