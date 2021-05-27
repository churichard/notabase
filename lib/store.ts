import { MutableRefObject } from 'react';
import create from 'zustand';
import { Note } from 'types/supabase';

type OpenNote = { note: Note; ref: MutableRefObject<HTMLElement | null> };
type Store = {
  openNotes: OpenNote[];
  setOpenNotes: (openNotes: OpenNote[], index?: number) => void;
};

export const useStore = create<Store>((set) => ({
  /**
   * Stores the notes that are open, including the main note and the stacked notes
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
