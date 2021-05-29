import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import produce from 'immer';
import type { State, StateCreator } from 'zustand';
import type { Draft } from 'immer';
import type { Note } from 'types/supabase';
import type { NoteUpdate } from './api/updateNote';

const immer =
  <T extends State>(
    config: StateCreator<T, (fn: (draft: Draft<T>) => void) => void>
  ): StateCreator<T> =>
  (set, get, api) =>
    config((fn) => set(produce<T>(fn)), get, api);

export type Notes = Record<Note['id'], Note>;

export type Store = {
  notes: Notes;
  setNotes: (value: Notes | ((value: Notes) => Notes)) => void;
  upsertNote: (note: Note) => void;
  updateNote: (note: NoteUpdate) => void;
  deleteNote: (noteId: string) => void;
  openNoteIds: Note['id'][];
  setOpenNoteIds: (openNoteIds: Note['id'][], index?: number) => void;
};

export const store = createVanilla<Store>(
  immer((set) => ({
    /**
     * An array of saved notes
     */
    notes: {},
    /**
     * Sets the notes
     */
    setNotes: (value: Notes | ((value: Notes) => Notes)) => {
      if (typeof value === 'function') {
        set((state) => {
          state.notes = value(state.notes);
        });
      } else {
        set((state) => {
          state.notes = value;
        });
      }
    },
    /**
     * If the note id exists, then update the note. Otherwise, insert it
     */
    upsertNote: (note: Note) => {
      set((state) => {
        if (state.notes[note.id]) {
          state.notes[note.id] = { ...state.notes[note.id], ...note };
        } else {
          state.notes[note.id] = note;
        }
      });
    },
    /**
     * Update the given note
     */
    updateNote: (note: NoteUpdate) => {
      set((state) => {
        if (state.notes[note.id]) {
          state.notes[note.id] = { ...state.notes[note.id], ...note };
        }
      });
    },
    /**
     * Delete the note with the given noteId
     */
    deleteNote: (noteId: string) => {
      set((state) => {
        delete state.notes[noteId];
      });
    },
    /**
     * The note ids that have their content visible, including the main note and the stacked notes
     */
    openNoteIds: [],
    /**
     * Replaces the open note ids at the given index (0 by default)
     */
    setOpenNoteIds: (newOpenNoteIds: Note['id'][], index?: number) => {
      if (!index) {
        set((state) => {
          state.openNoteIds = newOpenNoteIds;
        });
        return;
      }
      // Replace the notes after the current note with the new note
      set((state) => {
        state.openNoteIds.splice(
          index,
          state.openNoteIds.length - index,
          ...newOpenNoteIds
        );
      });
    },
  }))
);

export const useStore = create(store);
