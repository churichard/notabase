import { useMemo } from 'react';
import { createEditor, Editor, Element, Node } from 'slate';
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
    // Instantiate editor
    const editor = createEditor();
    editor.children = note.content;

    // Find matching note link nodes
    const linkNodes = Editor.nodes(editor, {
      at: [], // We need this to search through the entire note content
      match: (n) =>
        Element.isElement(n) &&
        n.type === ElementType.NoteLink &&
        n.noteId === noteId &&
        !!Node.string(n),
    });

    // Get the parent text
    const matches = [];
    for (const [, path] of linkNodes) {
      const [parentNode] = Editor.parent(editor, path);
      matches.push(Node.string(parentNode));
    }

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
