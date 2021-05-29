import type { MutableRefObject } from 'react';
import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import type { Note } from 'types/supabase';
import type { NoteUpdate } from './api/updateNote';

type OpenNote = {
  id: Note['id'];
  ref: MutableRefObject<HTMLElement | null>;
};

export type Store = {
  notes: Note[];
  setNotes: (value: Note[] | ((value: Note[]) => Note[])) => void;
  upsertNote: (note: Note) => void;
  updateNote: (note: NoteUpdate) => void;
  deleteNote: (noteId: string) => void;
  openNotes: OpenNote[];
  setOpenNotes: (openNotes: OpenNote[], index?: number) => void;
};

export const store = createVanilla<Store>((set, get) => ({
  /**
   * An array of saved notes
   */
  notes: [],
  /**
   * Sets the notes
   */
  setNotes: (value: Note[] | ((value: Note[]) => Note[])) => {
    if (typeof value === 'function') {
      set((state) => ({ notes: value(state.notes) }));
    } else {
      set({ notes: value });
    }
  },
  /**
   * If the note id exists, then update the note. Otherwise, insert it
   */
  upsertNote: (note: Note) => {
    const notes = get().notes;
    const index = notes.findIndex((n) => n.id === note.id);

    if (index >= 0) {
      notes[index] = { ...notes[index], ...note };
    } else {
      notes.push(note);
    }
    set({ notes });
  },
  /**
   * Update the given note
   */
  updateNote: (note: NoteUpdate) => {
    const notes = get().notes;
    const index = notes.findIndex((n) => n.id === note.id);

    if (index >= 0) {
      notes[index] = { ...notes[index], ...note };
      set({ notes });
    }
  },
  /**
   * Delete the note with the given noteId
   */
  deleteNote: (noteId: string) => {
    const notes = get().notes;
    const index = notes.findIndex((note) => note.id === noteId);
    if (index >= 0) {
      notes.splice(index, 1);
      set({ notes });
    }
  },
  /**
   * The notes that have their content visible, including the main note and the stacked notes
   */
  openNotes: [],
  /**
   * Replaces the open notes at the given index (0 by default)
   */
  setOpenNotes: (newOpenNotes: OpenNote[], index?: number) => {
    if (!index) {
      set({ openNotes: newOpenNotes });
      return;
    }
    // Replace the notes after the current note with the new note
    const openNotes = get().openNotes;
    openNotes.splice(index, openNotes.length - index, ...newOpenNotes);
    set({ openNotes });
  },
}));

export const useStore = create(store);
