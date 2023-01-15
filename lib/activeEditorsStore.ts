import { Editor } from 'slate';
import createNotabaseEditor from 'editor/createEditor';

// Map from note id to slate editor
let activeEditors: Record<string, Editor> = {};

let listeners: Array<() => void> = [];

export const activeEditorsStore = {
  getActiveEditor(noteId: string) {
    return activeEditors[noteId];
  },
  addActiveEditor(noteId: string) {
    if (activeEditors[noteId]) {
      return;
    }
    activeEditors = { ...activeEditors, [noteId]: createNotabaseEditor() };
    emitChange();
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return activeEditors;
  },
};

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export default activeEditorsStore;
