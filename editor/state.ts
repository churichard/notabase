import { atom } from 'jotai';
import { Range } from 'slate';

// Stores state for the "add link" popover
export const addLinkPopoverAtom = atom<{
  isVisible: boolean;
  selection?: Range;
  isLink?: boolean;
}>({ isVisible: false, selection: undefined, isLink: false });
