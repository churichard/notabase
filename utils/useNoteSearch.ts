import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore } from 'lib/store';

export default function useNoteSearch(searchText: string) {
  const notes = useStore((state) => state.notes);
  const fuse = useMemo(() => new Fuse(notes, { keys: ['title'] }), [notes]);
  const searchResults = useMemo(
    () => fuse.search(searchText, { limit: 10 }).map((result) => result.item),
    [fuse, searchText]
  );
  return searchResults;
}
