import useSWR, { SWRConfiguration } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export const NOTE_TITLES_KEY = 'api/noteTitles';

export default function useNoteTitles(options?: SWRConfiguration) {
  return useSWR<Array<Note>>(NOTE_TITLES_KEY, getNoteTitles, options);
}

const getNoteTitles = async () => {
  const { data } = await supabase
    .from<Note>('notes')
    .select('id, title')
    .order('title');
  return data ?? [];
};
