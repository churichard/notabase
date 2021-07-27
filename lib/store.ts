import create, { State, StateCreator } from 'zustand';
import createVanilla from 'zustand/vanilla';
import { persist, StateStorage } from 'zustand/middleware';
import produce, { Draft } from 'immer';
import localforage from 'localforage';
import type { Note } from 'types/supabase';
import createUserSettingsSlice, {
  UserSettings,
} from './createUserSettingsSlice';
import type { NoteUpdate } from './api/updateNote';

export { default as shallowEqual } from 'zustand/shallow';
export { default as deepEqual } from 'fast-deep-equal';

const immer =
  <T extends State>(
    config: StateCreator<T, (fn: (draft: Draft<T>) => void) => void>
  ): StateCreator<T> =>
  (set, get, api) =>
    config((fn) => set(produce<T>(fn)), get, api);

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await localforage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
};

export type Notes = Record<Note['id'], Note>;

export type Store = {
  notes: Notes;
  setNotes: (value: Notes | ((value: Notes) => Notes)) => void;
  upsertNote: (note: Note) => void;
  updateNote: (note: NoteUpdate) => void;
  deleteNote: (noteId: string) => void;
  openNoteIds: string[];
  setOpenNoteIds: (openNoteIds: string[], index?: number) => void;
  isPageStackingOn: boolean;
  setIsPageStackingOn: (value: boolean | ((value: boolean) => boolean)) => void;
} & UserSettings;

export const store = createVanilla<Store>(
  persist(
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
      openNoteIds: [],
      /**
       * Replaces the open notes at the given index (0 by default)
       */
      setOpenNoteIds: (newOpenNoteIds: string[], index?: number) => {
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
      ...createUserSettingsSlice(set),
    })),
    {
      name: 'notabase-storage',
      version: 1,
      getStorage: () => storage,
      whitelist: ['isSidebarOpen', 'noteSort'],
    }
  )
);

export const useStore = create(store);
