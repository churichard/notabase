import { Descendant, Editor } from 'slate';
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

// Get editor from active editors if it exists, or create a new one
export function getActiveOrTempEditor(noteId: string, content: Descendant[]) {
  let editor = activeEditorsStore.getActiveEditor(noteId);
  if (!editor) {
    editor = createNotabaseEditor();
    editor.children = content;
  }
  return editor;
}

export default activeEditorsStore;
