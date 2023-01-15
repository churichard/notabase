import { Draft } from 'immer';
import { createSetter, Setter, Store } from './store';

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
  setDarkMode: Setter<boolean>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Setter<boolean>;
  isPageStackingOn: boolean;
  setIsPageStackingOn: Setter<boolean>;
  noteSort: Sort;
  setNoteSort: Setter<Sort>;
};

const createUserSettingsSlice = (
  set: (fn: (draft: Draft<Store>) => void) => void
) => ({
  darkMode: false,
  setDarkMode: createSetter(set, 'darkMode'),
  isSidebarOpen: true,
  setIsSidebarOpen: createSetter(set, 'isSidebarOpen'),
  isPageStackingOn: true,
  setIsPageStackingOn: createSetter(set, 'isPageStackingOn'),
  noteSort: Sort.TitleAscending,
  setNoteSort: createSetter(set, 'noteSort'),
});

export default createUserSettingsSlice;
