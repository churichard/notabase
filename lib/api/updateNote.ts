import type { PickPartial } from 'types/utils';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { store } from 'lib/store';

export type NoteUpdate = PickPartial<
  Note,
  'user_id' | 'content' | 'title' | 'created_at' | 'updated_at'
>;

export default async function updateNote(note: NoteUpdate) {
  const response = await supabase
    .from<Note>('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', note.id)
    .single();

  if (response.data) {
    // Update updated_at locally
    store
      .getState()
      .updateNote({ id: note.id, updated_at: response.data.updated_at });
  }

  return response;
}
