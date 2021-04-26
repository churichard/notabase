import { mutate } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { NOTE_TITLES_KEY } from './useNoteTitles';

export default async function upsertNote(note: Partial<Note>) {
  const { data } = await supabase
    .from<Note>('notes')
    .upsert(note, { onConflict: 'user_id, title' })
    .single();

  mutate(NOTE_TITLES_KEY); // Refreshes the list of notes in the sidebar

  return data;
}
