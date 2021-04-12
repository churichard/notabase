import useSWR, { SWRConfiguration } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export const NOTES_KEY = 'api/notes';

export default function useNotes(options?: SWRConfiguration) {
  return useSWR<Array<Note>>(NOTES_KEY, getNotes, options);
}

const getNotes = async () => {
  const { data } = await supabase
    .from<Note>('notes')
    .select('id, title, content');
  return data ?? [];
};
