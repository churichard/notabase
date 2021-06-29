import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { deepEqual, useStore } from 'lib/store';

export type NoteSearchMatch = Fuse.FuseResultMatch;

export const TEXT_KEY = 'content.children.text';

type NoteSearchOptions = {
  numOfResults?: number;
  searchContent?: boolean;
};

export default function useNoteSearch(
  searchText: string,
  options: NoteSearchOptions = {}
) {
  const { numOfResults = 10, searchContent = false } = options;

  const notes = useStore(
    (state) =>
      Object.values(state.notes).map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
      })),
    deepEqual
  );

  const keys = useMemo(
    () => (searchContent ? [TEXT_KEY] : ['title']),
    [searchContent]
  );
  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys,
        ...(searchContent
          ? { includeMatches: true, ignoreLocation: true, threshold: 0 }
          : { threshold: 0.1 }),
      }),
    [notes, keys, searchContent]
  );

  const searchResults = useMemo(
    () => fuse.search(searchText, { limit: numOfResults }),
    [fuse, searchText, numOfResults]
  );
  return searchResults;
}
