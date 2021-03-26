import { mutate } from 'swr';
import { DEFAULT_NOTE_CONTENT } from 'editor/constants';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { NOTE_TITLES_KEY } from './useNoteTitles';

export default async function addNote(userId: string, title: string) {
  const { data } = await supabase
    .from<Note>('notes')
    .insert([
      {
        user_id: userId,
        title,
        content: JSON.stringify(DEFAULT_NOTE_CONTENT),
      },
    ])
    .single();

  mutate(NOTE_TITLES_KEY); // Adds the new note to the sidebar

  return data;
}
