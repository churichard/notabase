import { WritableDraft } from 'immer/dist/internal';
import { Store } from './store';

export enum Sort {
  TitleAscending = 'TITLE_ASCENDING',
  TitleDescending = 'TITLE_DESCENDING',
}

export const ReadableNameBySort = {
  [Sort.TitleAscending]: 'Sort by title (A-Z)',
  [Sort.TitleDescending]: 'Sort by title (Z-A)',
} as const;

export type UserSettings = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  noteSort: Sort;
  setNoteSort: (value: Sort | ((value: Sort) => Sort)) => void;
};

const createUserSettingsSlice = (
  set: (fn: (draft: WritableDraft<Store>) => void) => void
) => ({
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
  noteSort: Sort.TitleAscending,
  setNoteSort: (value: Sort | ((value: Sort) => Sort)) => {
    if (typeof value === 'function') {
      set((state) => {
        state.noteSort = value(state.noteSort);
      });
    } else {
      set((state) => {
        state.noteSort = value;
      });
    }
  },
});

export default createUserSettingsSlice;
