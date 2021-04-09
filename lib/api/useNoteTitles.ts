import useSWR, { SWRConfiguration } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export const NOTE_TITLES_KEY = 'api/noteTitles';

export default function useNoteTitles(options?: SWRConfiguration) {
  const userId = supabase.auth.user()?.id ?? '';
  return useSWR<Array<Note>>(
    NOTE_TITLES_KEY,
    () => getNoteTitles(userId),
    options
  );
}

const getNoteTitles = async (userId: string) => {
  const { data } = await supabase
    .from<Note>('notes')
    .select('id, title')
    .eq('user_id', userId)
    .order('title');
  return data ?? [];
};
