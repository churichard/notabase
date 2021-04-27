import { mutate } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { NOTE_TITLES_KEY } from './useNoteTitles';
import { NOTES_KEY } from './useNotes';

export default async function updateNote(id: string, note: Partial<Note>) {
  const response = await supabase.from<Note>('notes').update(note).eq('id', id);

  if (note.title && !response.error) {
    mutate(NOTE_TITLES_KEY); // Update note title in sidebar
  }

  if (note.content && !response.error) {
    mutate(NOTES_KEY); // Update notes (for updating backlinks in other open notes)
  }

  return response;
}
