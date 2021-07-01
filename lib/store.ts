import create, { State, StateCreator } from 'zustand';
import createVanilla from 'zustand/vanilla';
import produce, { Draft } from 'immer';
import { Path } from 'slate';
import type { Note } from 'types/supabase';
import type { NoteUpdate } from './api/updateNote';

export { default as shallowEqual } from 'zustand/shallow';
export { default as deepEqual } from 'fast-deep-equal';

const immer =
  <T extends State>(
    config: StateCreator<T, (fn: (draft: Draft<T>) => void) => void>
  ): StateCreator<T> =>
  (set, get, api) =>
    config((fn) => set(produce<T>(fn)), get, api);

export type Notes = Record<Note['id'], Note>;

type OpenNote = {
  id: string;
  highlightedPath?: Path;
};

export type Store = {
  notes: Notes;
  setNotes: (value: Notes | ((value: Notes) => Notes)) => void;
  upsertNote: (note: Note) => void;
  updateNote: (note: NoteUpdate) => void;
  deleteNote: (noteId: string) => void;
  openNotes: OpenNote[];
  setOpenNotes: (openNotes: OpenNote[], index?: number) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  isPageStackingOn: boolean;
  setIsPageStackingOn: (value: boolean | ((value: boolean) => boolean)) => void;
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
     * The notes that have their content visible, including the main note and the stacked notes
     */
    openNotes: [],
    /**
     * Replaces the open notes at the given index (0 by default)
     */
    setOpenNotes: (newOpenNotes: OpenNote[], index?: number) => {
      if (!index) {
        set((state) => {
          state.openNotes = newOpenNotes;
        });
        return;
      }
      // Replace the notes after the current note with the new note
      set((state) => {
        state.openNotes.splice(
          index,
          state.openNotes.length - index,
          ...newOpenNotes
        );
      });
    },
    isSidebarOpen: true,
    setIsSidebarOpen: (value: boolean | ((value: boolean) => boolean)) => {
      if (typeof value === 'function') {
        set((state) => {
          state.isSidebarOpen = value(state.isSidebarOpen);
        });
      } else {
        set((state) => {
          state.isSidebarOpen = value;
        });
      }
    },
    isPageStackingOn: true,
    setIsPageStackingOn: (value: boolean | ((value: boolean) => boolean)) => {
      if (typeof value === 'function') {
        set((state) => {
          state.isPageStackingOn = value(state.isPageStackingOn);
        });
      } else {
        set((state) => {
          state.isPageStackingOn = value;
        });
      }
    },
  }))
);

export const useStore = create(store);
