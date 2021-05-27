import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export default async function upsertNote(note: Partial<Note>) {
  const { data } = await supabase
    .from<Note>('notes')
    .upsert(note, { onConflict: 'user_id, title' })
    .single();

  // Refreshes the list of notes in the sidebar
  if (data) {
    store.getState().upsertNote(data);
  }

  return data;
}
