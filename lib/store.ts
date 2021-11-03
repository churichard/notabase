import create, { State, StateCreator, SetState, GetState } from 'zustand';
import createVanilla from 'zustand/vanilla';
import { persist, StateStorage, StoreApiWithPersist } from 'zustand/middleware';
import produce, { Draft } from 'immer';
import localforage from 'localforage';
import type { Note } from 'types/supabase';
import { BillingFrequency, PlanId } from 'constants/pricing';
import { caseInsensitiveStringEqual } from 'utils/string';
import { Backlink } from 'editor/backlinks/useBacklinks';
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
  _hasHydrated: boolean; // TODO: temporary until https://github.com/pmndrs/zustand/issues/562 gets fixed
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

export const store = createVanilla<
  Store,
  SetState<Store>,
  GetState<Store>,
  StoreApiWithPersist<Store>
>(
  persist(
    immer((set) => ({
      _hasHydrated: false,
      /**
       * The billing details of the current user
       */
      billingDetails: { planId: PlanId.Basic },
      setBillingDetails: setter(set, 'billingDetails'),
      /**
       * Map of note id to notes
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
      setNoteTree: setter(set, 'noteTree'),
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
      setIsUpgradeModalOpen: setter(set, 'isUpgradeModalOpen'),
      /**
       * Cache of block id to backlinks
       */
      blockIdToBacklinksMap: {},
      setBlockIdToBacklinksMap: setter(set, 'blockIdToBacklinksMap'),
      sidebarTab: SidebarTab.Notes,
      setSidebarTab: setter(set, 'sidebarTab'),
      sidebarSearchQuery: '',
      setSidebarSearchQuery: setter(set, 'sidebarSearchQuery'),
      ...createUserSettingsSlice(set),
    })),
    {
      name: 'notabase-storage',
      version: 1,
      getStorage: () => storage,
      partialize: (state) => ({
        openNoteIds: state.openNoteIds,
        isSidebarOpen: state.isSidebarOpen,
        noteSort: state.noteSort,
        darkMode: state.darkMode,
        isPageStackingOn: state.isPageStackingOn,
      }),
      onRehydrateStorage: () => () => {
        useStore.setState({ _hasHydrated: true });
      },
    }
  )
);

export const useStore = create<
  Store,
  SetState<Store>,
  GetState<Store>,
  StoreApiWithPersist<Store>
>(store);

/**
 * Deletes the tree item with the given id and returns it.
 */
const deleteTreeItem = (
  tree: NoteTreeItem[],
  id: string
): NoteTreeItem | null => {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.id === id) {
      tree.splice(i, 1);
      return item;
    } else if (item.children.length > 0) {
      const result = deleteTreeItem(item.children, id);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

/**
 * Inserts the given item into the tree as a child of the item with targetId, and returns true if it was inserted.
 * If targetId is null, inserts the item into the root level.
 */
const insertTreeItem = (
  tree: NoteTreeItem[],
  item: NoteTreeItem,
  targetId: string | null
): boolean => {
  if (targetId === null) {
    tree.push(item);
    return true;
  }

  for (let i = 0; i < tree.length; i++) {
    const treeItem = tree[i];
    if (treeItem.id === targetId) {
      tree[i].children.push(item);
      return true;
    } else if (treeItem.children.length > 0) {
      const result = insertTreeItem(treeItem.children, item, targetId);
      if (result) {
        return result;
      }
    }
  }
  return false;
};

/**
 * Expands or collapses the tree item with the given id, and returns true if it was updated.
 */
const toggleNoteTreeItemCollapsed = (
  tree: NoteTreeItem[],
  id: string
): boolean => {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.id === id) {
      tree[i] = { ...item, collapsed: !item.collapsed };
      return true;
    } else if (item.children.length > 0) {
      const result = toggleNoteTreeItemCollapsed(item.children, id);
      if (result) {
        return result;
      }
    }
  }
  return false;
};

/**
 * Gets the note tree item corresponding to the given noteId.
 */
export const getNoteTreeItem = (
  tree: NoteTreeItem[],
  id: string
): NoteTreeItem | null => {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.id === id) {
      return item;
    } else if (item.children.length > 0) {
      const result = getNoteTreeItem(item.children, id);
      if (result) {
        return result;
      }
    }
  }
  return null;
};
