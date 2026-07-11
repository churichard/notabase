import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';

export default async function loadNotesContent(noteIds: string[]) {
  if (noteIds.length === 0) return new Map<Note['id'], Note['content']>();
  const { data, error } = await supabase
    .from('notes')
    .select('id, content')
    .in('id', noteIds);
  if (error) throw error;
  return new Map(data.map((note) => [note.id, note.content]));
}
