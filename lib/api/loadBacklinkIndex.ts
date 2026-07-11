import supabase from 'lib/supabase';
import { store } from 'lib/store';
import type { Note } from 'types/supabase';

let pendingLoad: Promise<void> | null = null;

const rowToNote = (row: {
  note_id: string;
  user_id: string;
  title: string;
  content: Note['content'];
}) =>
  ({
    id: row.note_id,
    user_id: row.user_id,
    title: row.title,
    content: row.content,
    created_at: '',
    updated_at: '',
    visibility: 'private',
  } as Note);

/**
 * Refreshes a single note in the backlink index cache, e.g. after a realtime
 * update from another client. No-op if the index hasn't been loaded yet.
 */
export async function refreshBacklinkNote(noteId: string) {
  if (!store.getState().isBacklinkIndexLoaded) return;

  const { data, error } = await supabase
    .from('note_backlink_index')
    .select('note_id, user_id, title, content')
    .eq('note_id', noteId)
    .maybeSingle();

  if (error || !data) return;

  store.getState().setBacklinkNotes((backlinkNotes) => ({
    ...backlinkNotes,
    [data.note_id]: {
      ...(backlinkNotes[data.note_id] ?? rowToNote(data)),
      title: data.title,
      content: data.content,
    },
  }));
}

export default function loadBacklinkIndex() {
  if (store.getState().isBacklinkIndexLoaded) return Promise.resolve();
  if (pendingLoad) return pendingLoad;

  pendingLoad = Promise.resolve(
    supabase
      .from('note_backlink_index')
      .select('note_id, user_id, title, content')
  )
    .then(({ data, error }) => {
      if (!error && data) {
        const notes = data.reduce<Record<string, Note>>((result, row) => {
          result[row.note_id] = rowToNote(row);
          return result;
        }, {});
        store.getState().setBacklinkNotes(notes);
        store.getState().setIsBacklinkIndexLoaded(true);
      }
    })
    .finally(() => {
      pendingLoad = null;
    });

  return pendingLoad;
}
