import { store } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import type { PickPartial } from 'types/utils';

export type NoteUpsert = PickPartial<
  Note,
  'id' | 'content' | 'created_at' | 'updated_at'
>;

export default async function upsertNote(note: NoteUpsert) {
  const { data } = await supabase
    .from<Note>('notes')
    .upsert(
      { ...note, updated_at: new Date().toISOString() },
      { onConflict: 'user_id, title' }
    )
    .single();

  // Refreshes the list of notes in the sidebar
  if (data) {
    store.getState().upsertNote(data);
  }

  return data;
}
