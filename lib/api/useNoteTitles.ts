import useSWR, { SWRConfiguration } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';

export const NOTE_TITLES_KEY = 'api/noteTitles';

export default function useNoteTitles(options?: SWRConfiguration) {
  const { user } = useAuth();
  return useSWR<Array<Note>>(
    NOTE_TITLES_KEY,
    () => getNoteTitles(user?.id ?? ''),
    options
  );
}

const getNoteTitles = async (userId: string) => {
  if (!userId) {
    return [];
  }
  const { data } = await supabase
    .from<Note>('notes')
    .select('id, title')
    .eq('user_id', userId)
    .order('title');
  return data ?? [];
};
