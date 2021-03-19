import { atom } from 'jotai';
import { Range } from 'slate';

// Stores state for the "add link" popover
export const addLinkPopoverAtom = atom<{
  isVisible: boolean;
  selection: Range | null;
}>({ isVisible: false, selection: null });
