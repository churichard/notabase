import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';
import { caseInsensitiveStringCompare } from 'utils/string';

export default async function updateNote(id: string, note: Partial<Note>) {
  const response = await supabase
    .from<Note>('notes')
    .update(note)
    .eq('id', id)
    .single();

  if (note.title && !response.error) {
    // Update note title in sidebar
    store.getState().setNotes((notes) => {
      const index = notes.findIndex((note) => note.id === id);
      if (index >= 0) {
        const newNotes = [...notes];
        newNotes[index] = { ...newNotes[index], ...note };
        return newNotes.sort((n1, n2) =>
          caseInsensitiveStringCompare(n1.title, n2.title)
        );
      } else {
        return notes;
      }
    });
  }

  return response;
}
