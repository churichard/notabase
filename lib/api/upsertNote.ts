import { store } from 'lib/store';
import supabase from 'lib/supabase';
import type { NoteInsert } from 'types/supabase';
import type { PickPartial } from 'types/utils';

type NoteUpsert = PickPartial<
  NoteInsert,
  'id' | 'user_id' | 'content' | 'created_at' | 'updated_at'
>;

export default async function upsertNote(note: NoteUpsert) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;

  if (!userId) {
    return;
  }

  const { data, error } = await supabase
    .from('notes')
    .upsert(
      { ...note, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id, title' }
    )
    .select()
    .single();

  // Refreshes the list of notes in the sidebar
  if (data) {
    store.getState().upsertNote(data);
    await supabase
      .from('users')
      .update({ note_tree: store.getState().noteTree })
      .eq('id', note.user_id);
  } else if (error) {
    console.error(error);
  }

  return data;
}
