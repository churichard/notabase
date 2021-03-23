import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export const GET_NOTE_TITLES_KEY = 'noteTitles';
export const getNoteTitles = async (userId: string) => {
  return await supabase
    .from<Note>('notes')
    .select('id, title')
    .eq('user_id', userId)
    .order('title');
};
