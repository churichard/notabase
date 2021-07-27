import { Draft } from 'immer';
import { setter, Store } from './store';

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
  isPageStackingOn: boolean;
  setIsPageStackingOn: (value: boolean | ((value: boolean) => boolean)) => void;
  noteSort: Sort;
  setNoteSort: (value: Sort | ((value: Sort) => Sort)) => void;
};

const createUserSettingsSlice = (
  set: (fn: (draft: Draft<Store>) => void) => void
) => ({
  isSidebarOpen: true,
  setIsSidebarOpen: setter(set, 'isSidebarOpen'),
  isPageStackingOn: true,
  setIsPageStackingOn: setter(set, 'isPageStackingOn'),
  noteSort: Sort.TitleAscending,
  setNoteSort: setter(set, 'noteSort'),
});

export default createUserSettingsSlice;
