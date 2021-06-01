import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { deepIsEqual, useStore } from 'lib/store';

export default function useNoteSearch(searchText: string) {
  const notes = useStore(
    (state) =>
      Object.values(state.notes).map((note) => ({
        id: note.id,
        title: note.title,
      })),
    deepIsEqual
  );
  const fuse = useMemo(() => new Fuse(notes, { keys: ['title'] }), [notes]);
  const searchResults = useMemo(
    () => fuse.search(searchText, { limit: 10 }).map((result) => result.item),
    [fuse, searchText]
  );
  return searchResults;
}
