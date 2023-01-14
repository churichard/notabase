import { Editor } from 'slate';
import { Store } from './store';

type ActiveNote = { id: string; editor: Editor };

export type EditorSlice = {
  activeNotes: ActiveNote[];
  setActiveNotes: (activeNotes: ActiveNote[], index?: number) => void;
};

const createEditorSlice = (
  set: (
    fn: Store | Partial<Store> | ((store: Store) => Store | Partial<Store>)
  ) => void
) => ({
  /**
   * The notes that have their content visible, including the main note and the stacked notes
   */
  activeNotes: [],
  /**
   * Replaces the active notes at the given index (0 by default)
   */
  setActiveNotes: (activeNotes: ActiveNote[], index?: number) => {
    if (!index) {
      set({ activeNotes });
      return;
    }
    // Replace the notes after the current note with the new note
    set((state) => {
      const newActiveNotes = state.activeNotes.slice();
      newActiveNotes.splice(
        index,
        state.activeNotes.length - index,
        ...activeNotes
      );
      return { activeNotes: newActiveNotes };
    });
  },
});

export default createEditorSlice;
