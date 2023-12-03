import type { PickPartial } from 'types/utils';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { store } from 'lib/store';

export type NoteUpdate = PickPartial<
  Note,
  'user_id' | 'content' | 'title' | 'created_at' | 'updated_at' | 'visibility'
>;

export default async function updateNote(note: NoteUpdate) {
  const response = await supabase
    .from('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', note.id)
    .select()
    .single();

  if (response.data) {
    // Update certain properties locally
    store.getState().updateNote({
      id: note.id,
      updated_at: response.data.updated_at,
      visibility: response.data.visibility,
    });
  }

  return response;
}
