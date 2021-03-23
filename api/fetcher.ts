import supabase from 'lib/supabase';
import { GET_NOTE_TITLES_KEY, getNoteTitles } from './note';

// Fetcher used for SWR
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
