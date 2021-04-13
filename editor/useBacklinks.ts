import { useMemo } from 'react';
import { Descendant, Element, Node, Text } from 'slate';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import { caseInsensitiveStringEqual } from 'utils/string';
import useNotes from 'lib/api/useNotes';

type Backlink = {
  id: string;
  title: string;
  matches: string[];
};

export default function useBacklinks(noteTitle: string) {
  const { data: notes = [] } = useNotes();
  const backlinks = useMemo(() => getBacklinks(notes, noteTitle), [
    notes,
    noteTitle,
  ]);
  return backlinks;
}

/**
 * Searches the notes array for note links to the given noteTitle
 * and returns an array of the matches.
 */
const getBacklinks = (notes: Note[], noteTitle: string): Backlink[] => {
  const result: Backlink[] = [];
  for (const note of notes) {
    const matches = getBacklinkMatches(note.content, noteTitle);
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

const getBacklinkMatches = (nodes: Descendant[], noteTitle: string) => {
  const result: Backlink['matches'] = [];
  for (const node of nodes) {
    result.push(...getBacklinkMatchesHelper(node, noteTitle));
  }
  return result;
};

const getBacklinkMatchesHelper = (
  node: Descendant,
  noteTitle: string
): Backlink['matches'] => {
  if (Text.isText(node)) {
    return [];
  }

  const result: Backlink['matches'] = [];
  const children = node.children;
  for (const child of children) {
    if (Element.isElement(child)) {
      if (
        child.type === ElementType.NoteLink &&
        caseInsensitiveStringEqual(child.title, noteTitle) &&
        Node.string(child)
      ) {
        result.push(Node.string(node));
      }
      result.push(...getBacklinkMatchesHelper(child, noteTitle));
    }
  }

  return result;
};
