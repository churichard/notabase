import { mutate } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { NOTE_TITLES_KEY } from './useNoteTitles';

export default async function getOrAddNote(
  userId: string,
  title: string,
  noteId?: string
) {
  const { data } = await supabase
    .from<Note>('notes')
    .upsert(
      [
        {
          id: noteId,
          user_id: userId,
          title: title,
        },
      ],
      { onConflict: 'user_id, title' }
    )
    .single();

  mutate(NOTE_TITLES_KEY); // Refreshes the list of notes in the sidebar

  return data;
}
