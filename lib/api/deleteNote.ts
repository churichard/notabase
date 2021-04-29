import { mutate } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { NOTE_TITLES_KEY } from './useNoteTitles';

export default async function deleteNote(id: string) {
  const response = await supabase.from<Note>('notes').delete().eq('id', id);

  mutate(NOTE_TITLES_KEY); // Update note titles in sidebar

  return response;
}
