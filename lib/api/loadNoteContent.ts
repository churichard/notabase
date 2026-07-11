import supabase from 'lib/supabase';
import { store } from 'lib/store';

const pendingLoads = new Map<string, Promise<boolean>>();

export default function loadNoteContent(noteId: string) {
  const existing = pendingLoads.get(noteId);
  if (existing) return existing;

  const request = Promise.resolve(
    supabase.from('notes').select('content').eq('id', noteId).single()
  )
    .then(({ data, error }) => {
      if (!error && data) {
        store.getState().updateNote({ id: noteId, content: data.content });
        store.getState().setNoteContentLoaded(noteId, true);
        return true;
      }
      return false;
    })
    .finally(() => pendingLoads.delete(noteId));

  pendingLoads.set(noteId, request);
  return request;
}
