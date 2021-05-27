import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export default async function deleteNote(id: string) {
  const response = await supabase.from<Note>('notes').delete().eq('id', id);

  // Update note titles in sidebar
  store.getState().deleteNote(id);

  return response;
}
