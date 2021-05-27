import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note, PartialNoteWithRequiredId } from 'types/supabase';

export default async function updateNote(note: PartialNoteWithRequiredId) {
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
