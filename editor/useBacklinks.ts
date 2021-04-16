import { useMemo } from 'react';
import { Descendant, Element, Node, Text } from 'slate';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import useNotes from 'lib/api/useNotes';

type Backlink = {
  id: string;
  title: string;
  matches: string[];
};

export default function useBacklinks(noteId: string) {
  const { data: notes = [] } = useNotes();
  const backlinks = useMemo(() => getBacklinks(notes, noteId), [notes, noteId]);
  return backlinks;
}

/**
 * Searches the notes array for note links to the given noteId
 * and returns an array of the matches.
 */
const getBacklinks = (notes: Note[], noteId: string): Backlink[] => {
  const result: Backlink[] = [];
  for (const note of notes) {
    const matches = getBacklinkMatches(note.content, noteId);
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

const getBacklinkMatches = (nodes: Descendant[], noteId: string) => {
  const result: Backlink['matches'] = [];
  for (const node of nodes) {
    result.push(...getBacklinkMatchesHelper(node, noteId));
  }
  return result;
};

const getBacklinkMatchesHelper = (
  node: Descendant,
  noteId: string
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
        child.noteId === noteId &&
        Node.string(child)
      ) {
        result.push(Node.string(node));
      }
      result.push(...getBacklinkMatchesHelper(child, noteId));
    }
  }

  return result;
};
