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
};
