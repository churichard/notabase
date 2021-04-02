import { useMemo } from 'react';
import Fuse from 'fuse.js';
import useNoteTitles from 'lib/api/useNoteTitles';

export default function useNoteSearch(searchText: string) {
  const { data: notes = [] } = useNoteTitles();
  const fuse = useMemo(() => new Fuse(notes, { keys: ['title'] }), [notes]);
  const searchResults = useMemo(
    () => fuse.search(searchText, { limit: 10 }).map((result) => result.item),
    [fuse, searchText]
  );
  return searchResults;
}
