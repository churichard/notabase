import { store } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note, User } from 'types/supabase';

export default async function deleteNote(id: string) {
  // Update note titles in sidebar
  store.getState().deleteNote(id);

  const response = await supabase.from<Note>('notes').delete().eq('id', id);

  await supabase
    .from<User>('users')
    .update({ note_tree: store.getState().noteTree });

  return response;
}
