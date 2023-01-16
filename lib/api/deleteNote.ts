import { store } from 'lib/store';
import supabase from 'lib/supabase';

export default async function deleteNote(userId: string, noteId: string) {
  // Update note titles in sidebar
  store.getState().deleteNote(noteId);

  const response = await supabase.from('notes').delete().eq('id', noteId);

  await supabase
    .from('users')
    .update({ note_tree: store.getState().noteTree })
    .eq('id', userId);

  return response;
}
