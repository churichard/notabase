import useSWR, { SWRConfiguration } from 'swr';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export const noteKey = (id: string) => `api/note/${id}`;

export default function useNote(id: string, options?: SWRConfiguration) {
  const userId = supabase.auth.user()?.id ?? '';
  return useSWR<Note | undefined>(
    noteKey(id),
    () => getNote(userId, id),
    options
  );
}

export const getNote = async (userId: string, noteId: string) => {
  const { data } = await supabase
    .from<Note>('notes')
    .select('id, title, content')
    .eq('user_id', userId)
    .eq('id', noteId)
    .single();
  return data ?? undefined;
};
