import { atom } from 'jotai';
import { Range } from 'slate';

// Stores state for the "add link" popover
export const addLinkPopoverAtom = atom<{
  isVisible: boolean;
  selection?: Range;
}>({ isVisible: false, selection: undefined });
