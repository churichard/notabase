import { mutate } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { NOTE_TITLES_KEY } from './useNoteTitles';

export default async function updateNote(
  userId: string,
  id: string,
  note: Partial<Note>
) {
  const response = await supabase
    .from<Note>('notes')
    .update(note)
    .eq('user_id', userId)
    .eq('id', id);

  if (note.title && !response.error) {
    mutate(NOTE_TITLES_KEY); // Update note title in sidebar
  }

  return response;
}
