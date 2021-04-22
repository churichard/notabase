import { MutableRefObject } from 'react';
import { atom } from 'jotai';
import { Range } from 'slate';
import { Note } from 'types/supabase';

// Stores state for the "add link" popover
export const addLinkPopoverAtom = atom<{
  isVisible: boolean;
  selection?: Range;
  isLink?: boolean;
}>({ isVisible: false, selection: undefined, isLink: false });

// Stores the notes that are open, including the main note and the stacked notes
export const openNotesAtom = atom<
  { note: Note; ref: MutableRefObject<HTMLElement | null> }[]
>([]);
