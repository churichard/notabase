import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { caseInsensitiveStringCompare } from 'utils/string';

export default async function upsertNote(note: Partial<Note>) {
  const { data } = await supabase
    .from<Note>('notes')
    .upsert(note, { onConflict: 'user_id, title' })
    .single();

  // Refreshes the list of notes in the sidebar
  if (data) {
    store.getState().setNotes((notes) => {
      const index = notes.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        const newNotes = [...notes];
        newNotes[index] = { ...newNotes[index], ...note };
        return newNotes;
      } else {
        return [...notes, data].sort((n1, n2) =>
          caseInsensitiveStringCompare(n1.title, n2.title)
        );
      }
    });
  }

  return data;
}
