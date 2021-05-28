import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import type { PickPartial } from 'types/utils';

type UpsertNote = PickPartial<Note, 'id' | 'content'>;

export default async function upsertNote(note: UpsertNote) {
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
