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
  noteSort: Sort;
  setNoteSort: (value: Sort | ((value: Sort) => Sort)) => void;
};

const createUserSettingsSlice = (
  set: (fn: (draft: WritableDraft<Store>) => void) => void
) => ({
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
