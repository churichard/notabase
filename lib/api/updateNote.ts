import type { PickPartial } from 'types/utils';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';

export type NoteUpdate = PickPartial<Note, 'user_id' | 'content' | 'title'>;

export default async function updateNote(note: NoteUpdate) {
  const response = await supabase
    .from<Note>('notes')
    .update(note)
    .eq('id', note.id)
    .single();

  if (!response.error) {
    // Update note title in sidebar and backlinks in other open notes
    store.getState().updateNote(note);
  }

  return response;
}
