import { atom } from 'jotai';
import { Range } from 'slate';

// Is the Add Link popover visible?
export const isAddingLinkAtom = atom(false);

// The saved editor selection
export const savedSelectionAtom = atom<Range | null>(null);
