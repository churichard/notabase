import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export default async function deleteNote(id: string) {
  const response = await supabase.from<Note>('notes').delete().eq('id', id);

  // Update note titles in sidebar
  store.getState().setNotes((notes) => {
    const index = notes.findIndex((note) => note.id === id);
    if (index >= 0) {
      const newNotes = [...notes];
      newNotes.splice(index, 1);
      return newNotes;
    } else {
      return notes;
    }
  });

  return response;
}
