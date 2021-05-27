import { MutableRefObject } from 'react';
import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { Note } from 'types/supabase';

type OpenNote = { note: Note; ref: MutableRefObject<HTMLElement | null> };

type Store = {
  notes: Note[];
  setNotes: (value: Note[] | ((value: Note[]) => Note[])) => void;
  openNotes: OpenNote[];
  setOpenNotes: (openNotes: OpenNote[], index?: number) => void;
};

export const store = createVanilla<Store>((set) => ({
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
