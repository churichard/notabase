import React, { useMemo } from 'react';
import Link from 'next/link';
import { Descendant, Element, Node, Text } from 'slate';
import { useCurrentNote } from 'utils/useCurrentNote';
import { ElementType } from 'types/slate';
import useNotes from 'lib/api/useNotes';
import { Note } from 'types/supabase';
import { caseInsensitiveStringEqual } from 'utils/string';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { data: notes = [] } = useNotes();
  const backlinks = useMemo(() => getBacklinks(notes, currentNote.title), [
    notes,
    currentNote.title,
  ]);

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <p className="px-4 text-xl text-gray-800">
        {backlinks.length} Linked References
      </p>
      {backlinks.length > 0 ? (
        <div className="mx-2 mt-2">
          {backlinks.map((backlink) => (
            <Link key={backlink.id} href={`/app/note/${backlink.id}`}>
              <a className="block p-2 rounded hover:bg-gray-200 active:bg-gray-300">
                <span className="block text-sm text-gray-800">
                  {backlink.title}
                </span>
                {backlink.matches.map((match, index) => {
                  return (
                    <span
                      key={index}
                      className="block my-1 text-xs text-gray-600"
                    >
                      {match}
                    </span>
                  );
                })}
              </a>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Searches the notes array for note links to the given noteTitle
 * and returns an array of the matches.
 */
const getBacklinks = (notes: Note[], noteTitle: string) => {
  const result = [];
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
  const result = [];
  for (const node of nodes) {
    result.push(...getBacklinkMatchesHelper(node, noteTitle));
  }
  return result;
};

const getBacklinkMatchesHelper = (
  node: Descendant,
  noteTitle: string
): string[] => {
  if (Text.isText(node)) {
    return [];
  }

  const result = [];
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
