export enum Sort {
  NameAscending = 'NAME_ASCENDING',
  NameDescending = 'NAME_DESCENDING',
}

export const ReadableNameBySort = {
  [Sort.NameAscending]: 'Sort by name (A-Z)',
  [Sort.NameDescending]: 'Sort by name (Z-A)',
} as const;

export type UserSettings = {
  noteSort: Sort;
};
