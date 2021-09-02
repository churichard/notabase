import create, { State, StateCreator } from 'zustand';
import createVanilla from 'zustand/vanilla';
import { persist, StateStorage } from 'zustand/middleware';
import produce, { Draft } from 'immer';
import localforage from 'localforage';
import type { Note } from 'types/supabase';
import { BillingFrequency, PlanId } from 'constants/pricing';
import { caseInsensitiveStringEqual } from 'utils/string';
import createUserSettingsSlice, {
  UserSettings,
} from './createUserSettingsSlice';
import type { NoteUpdate } from './api/updateNote';

export { default as shallowEqual } from 'zustand/shallow';

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

export type BillingDetails = {
  planId: PlanId;
  frequency: BillingFrequency;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
} | null;

export type Store = {
  billingDetails: BillingDetails;
  setBillingDetails: Setter<BillingDetails>;
  notes: Notes;
  setNotes: Setter<Notes>;
  upsertNote: (note: Note) => void;
  updateNote: (note: NoteUpdate) => void;
  deleteNote: (noteId: string) => void;
  openNoteIds: string[];
  setOpenNoteIds: (openNoteIds: string[], index?: number) => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: Setter<boolean>;
} & UserSettings;

type FunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type StoreWithoutFunctions = Omit<Store, FunctionPropertyNames<Store>>;

export type Setter<T> = (value: T | ((value: T) => T)) => void;
export const setter =
  <K extends keyof StoreWithoutFunctions>(
    set: (fn: (draft: Draft<Store>) => void) => void,
    key: K
  ) =>
  (value: Store[K] | ((value: Store[K]) => Store[K])) => {
    if (typeof value === 'function') {
      set((state) => {
        state[key] = value(state[key]);
      });
    } else {
      set((state) => {
        state[key] = value;
      });
    }
  };

export const store = createVanilla<Store>(
  persist(
    immer((set) => ({
      billingDetails: null,
      setBillingDetails: setter(set, 'billingDetails'),
      /**
       * An array of saved notes
       */
      notes: {},
      /**
       * Sets the notes
       */
      setNotes: setter(set, 'notes'),
      /**
       * If the note id exists, then update the note. Otherwise, insert it
       */
      upsertNote: (note: Note) => {
        set((state) => {
          if (state.notes[note.id]) {
            state.notes[note.id] = { ...state.notes[note.id], ...note };
          } else {
            const existingNote = Object.values(state.notes).find((n) =>
              caseInsensitiveStringEqual(n.title, note.title)
            );
            if (existingNote) {
              // Update existing note
              state.notes[existingNote.id] = {
                ...state.notes[existingNote.id],
                ...note,
              };
            } else {
              // Insert new note
              state.notes[note.id] = note;
            }
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
      isUpgradeModalOpen: false,
      setIsUpgradeModalOpen: setter(set, 'isUpgradeModalOpen'),
      ...createUserSettingsSlice(set),
    })),
    {
      name: 'notabase-storage',
      version: 1,
      getStorage: () => storage,
      whitelist: ['openNoteIds', 'isSidebarOpen', 'noteSort', 'darkMode'],
    }
  )
);

export const useStore = create(store);
