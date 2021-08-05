import type { PickPartial } from 'types/utils';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';

export type NoteUpdate = PickPartial<
  Note,
  'user_id' | 'content' | 'title' | 'created_at' | 'updated_at'
>;

export default async function updateNote(note: NoteUpdate) {
  const response = await supabase
    .from<Note>('notes')
    .update(note)
    .eq('id', note.id)
    .single();

  return response;
}
