import { Draft } from 'immer';
import { setter, Store } from './store';

export enum Sort {
  TitleAscending = 'TITLE_ASCENDING',
  TitleDescending = 'TITLE_DESCENDING',
  DateModifiedAscending = 'DATE_MODIFIED_ASCENDING',
  DateModifiedDescending = 'DATE_MODIFIED_DESCENDING',
  DateCreatedAscending = 'DATE_CREATED_ASCENDING',
  DateCreatedDescending = 'DATE_CREATED_DESCENDING',
}

export const ReadableNameBySort = {
  [Sort.TitleAscending]: 'Title (A-Z)',
  [Sort.TitleDescending]: 'Title (Z-A)',
  [Sort.DateModifiedAscending]: 'Date modified (old to new)',
  [Sort.DateModifiedDescending]: 'Date modified (new to old)',
  [Sort.DateCreatedAscending]: 'Date created (old to new)',
  [Sort.DateCreatedDescending]: 'Date created (new to old)',
} as const;

export type UserSettings = {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((value: boolean) => boolean)) => void;
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
  darkMode: false,
  setDarkMode: setter(set, 'darkMode'),
  isSidebarOpen: true,
  setIsSidebarOpen: setter(set, 'isSidebarOpen'),
  isPageStackingOn: true,
  setIsPageStackingOn: setter(set, 'isPageStackingOn'),
  noteSort: Sort.TitleAscending,
  setNoteSort: setter(set, 'noteSort'),
});

export default createUserSettingsSlice;
