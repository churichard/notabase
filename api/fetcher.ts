import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export const GET_NOTE_TITLES_KEY = '/api/notes';
export const getNoteTitles = (userId: string) => {
  return supabase
    .from<Note>('notes')
    .select('id, title')
    .eq('user_id', userId)
    .order('title');
};

export const fetcher = async (key: string) => {
  const userId = supabase.auth.user()?.id;

  if (!userId) {
    return null;
  }

  let result;
  switch (key) {
    case GET_NOTE_TITLES_KEY:
      result = await getNoteTitles(userId);
      break;
    default:
      break;
  }

  if (result?.error) {
    throw result.error;
  }

  return result?.data ?? null;
};
