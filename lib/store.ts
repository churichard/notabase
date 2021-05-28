import { MutableRefObject } from 'react';
import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { Note, PartialNoteWithRequiredId } from 'types/supabase';
import { caseInsensitiveStringCompare } from 'utils/string';

type OpenNote = { note: Note; ref: MutableRefObject<HTMLElement | null> };

type Store = {
  notes: Note[];
  setNotes: (value: Note[] | ((value: Note[]) => Note[])) => void;
  upsertNote: (note: Note) => void;
  updateNote: (note: PartialNoteWithRequiredId) => void;
  deleteNote: (noteId: string) => void;
  openNotes: OpenNote[];
  setOpenNotes: (openNotes: OpenNote[], index?: number) => void;
};

export const store = createVanilla<Store>((set, get) => ({
  /**
   * An array of saved notes
   */
  notes: [],
  setNotes: (value: Note[] | ((value: Note[]) => Note[])) => {
    if (typeof value === 'function') {
      set((state) => ({ notes: value(state.notes) }));
    } else {
      set({ notes: value });
    }
  },
  upsertNote: (note: Note) => {
    set((state) => {
      const notes = state.notes;
      const index = notes.findIndex((n) => n.id === note.id);

      const newNotes = [...notes];
      if (index >= 0) {
        newNotes[index] = { ...newNotes[index], ...note };
      } else {
        newNotes.push(note);
      }
      newNotes.sort((n1, n2) =>
        caseInsensitiveStringCompare(n1.title, n2.title)
      );

      return {
        notes: newNotes,
      };
    });
  },
  updateNote: (note: PartialNoteWithRequiredId) => {
    const notes = get().notes;
    const index = notes.findIndex((n) => n.id === note.id);

    if (index >= 0) {
      const newNotes = [...notes];
      newNotes[index] = { ...newNotes[index], ...note };
      newNotes.sort((n1, n2) =>
        caseInsensitiveStringCompare(n1.title, n2.title)
      );
      set({ notes: newNotes });
    }
  },
  deleteNote: (noteId: string) => {
    const notes = get().notes;
    const index = notes.findIndex((note) => note.id === noteId);
    if (index >= 0) {
      const newNotes = [...notes];
      newNotes.splice(index, 1);
      set({ notes: newNotes });
    }
  },
  /**
   * Sets the notes
   */
  /**
   * The notes that have their content visible, including the main note and the stacked notes
   */
  openNotes: [],
  /**
   * Replaces the open notes at the given index (0 by default)
   */
  setOpenNotes: (newOpenNotes: OpenNote[], index?: number) => {
    set((state) => {
      if (!index) {
        return { openNotes: newOpenNotes };
      }
      // Replace the notes after the current note with the new note
      const newNotes = [...state.openNotes];
      newNotes.splice(index, state.openNotes.length - index, ...newOpenNotes);
      return { openNotes: newNotes };
    });
  },
}));

export const useStore = create(store);
