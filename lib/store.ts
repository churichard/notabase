import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type { Draft } from 'immer';
import { immer } from 'zustand/middleware/immer';
import type { Note } from 'types/supabase';
import { BillingFrequency, PlanId } from 'constants/pricing';
import { caseInsensitiveStringEqual } from 'utils/string';
import { Backlink } from 'editor/backlinks/useBacklinks';
import createUserSettingsSlice, {
  UserSettings,
} from './createUserSettingsSlice';
import type { NoteUpdate } from './api/updateNote';
import {
  deleteTreeItem,
  insertTreeItem,
  toggleNoteTreeItemCollapsed,
} from './storeUtils';

export { shallow } from 'zustand/shallow';

localforage.config({
  name: 'notabase',
  version: 1.0,
  storeName: 'user_data',
});

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await localforage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

type FunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type StoreWithoutFunctions = Omit<Store, FunctionPropertyNames<Store>>;

export type Setter<T> = (value: T | ((value: T) => T)) => void;
export type CreateSetter = <K extends keyof StoreWithoutFunctions>(
  set: (fn: (draft: Draft<Store>) => void) => void,
  key: K
) => (value: Store[K] | ((value: Store[K]) => Store[K])) => void;

/**
 * Helper function that constructs a setter function.
 */
export const createSetter: CreateSetter = (set, key) => (value) => {
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

export type Notes = Record<Note['id'], Note>;

export type NoteTreeItem = {
  id: Note['id'];
  children: NoteTreeItem[];
  collapsed: boolean;
};

export type BillingDetails =
  | { planId: PlanId.Basic }
  | {
      planId: PlanId;
      frequency: BillingFrequency;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
    };

export enum SidebarTab {
  Notes,
  Search,
}

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
  noteTree: NoteTreeItem[];
  setNoteTree: Setter<NoteTreeItem[]>;
  moveNoteTreeItem: (noteId: string, newParentNoteId: string | null) => void;
  toggleNoteTreeItemCollapsed: (noteId: string) => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: Setter<boolean>;
  blockIdToBacklinksMap: Record<string, Backlink[] | undefined>;
  setBlockIdToBacklinksMap: Setter<Record<string, Backlink[] | undefined>>;
  sidebarTab: SidebarTab;
  setSidebarTab: Setter<SidebarTab>;
  sidebarSearchQuery: string;
  setSidebarSearchQuery: Setter<string>;
} & UserSettings;

export const store = createStore<Store>()(
  persist(
    immer((set) => ({
      /**
       * The billing details of the current user
       */
      billingDetails: { planId: PlanId.Basic },
      setBillingDetails: createSetter(set, 'billingDetails'),
      /**
       * Map of note id to notes
       */
      notes: {},
      /**
       * Sets the notes
       */
      setNotes: createSetter(set, 'notes'),
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
              insertTreeItem(
                state.noteTree,
                { id: note.id, children: [], collapsed: true },
                null
              );
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
          const item = deleteTreeItem(state.noteTree, noteId);
          if (item && item.children.length > 0) {
            for (const child of item.children) {
              insertTreeItem(state.noteTree, child, null);
            }
          }
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
      /**
       * The tree of notes visible in the sidebar
       */
      noteTree: [],
      setNoteTree: createSetter(set, 'noteTree'),
      /**
       * Moves the tree item with the given noteId to the given newParentNoteId's children
       */
      moveNoteTreeItem: (noteId: string, newParentNoteId: string | null) => {
        // Don't do anything if the note ids are the same
        if (noteId === newParentNoteId) {
          return;
        }
        set((state) => {
          const item = deleteTreeItem(state.noteTree, noteId);
          if (item) {
            insertTreeItem(state.noteTree, item, newParentNoteId);
          }
        });
      },
      /**
       * Expands or collapses the tree item with the given noteId
       */
      toggleNoteTreeItemCollapsed: (noteId: string) => {
        set((state) => {
          toggleNoteTreeItemCollapsed(state.noteTree, noteId);
        });
      },
      /**
       * Whether or not the upgrade modal is open
       */
      isUpgradeModalOpen: false,
      setIsUpgradeModalOpen: createSetter(set, 'isUpgradeModalOpen'),
      /**
       * Cache of block id to backlinks
       */
      blockIdToBacklinksMap: {},
      setBlockIdToBacklinksMap: createSetter(set, 'blockIdToBacklinksMap'),
      sidebarTab: SidebarTab.Notes,
      setSidebarTab: createSetter(set, 'sidebarTab'),
      sidebarSearchQuery: '',
      setSidebarSearchQuery: createSetter(set, 'sidebarSearchQuery'),
      ...createUserSettingsSlice(set),
    })),
    {
      name: 'notabase-storage',
      version: 1,
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        openNoteIds: state.openNoteIds,
        isSidebarOpen: state.isSidebarOpen,
        noteSort: state.noteSort,
        darkMode: state.darkMode,
        isPageStackingOn: state.isPageStackingOn,
      }),
    }
  )
);

const useBoundStore = <T>(
  selector: (state: Store) => T,
  equals?: (a: T, b: T) => boolean
) => useStore(store, selector, equals);

export { useBoundStore as useStore };
