import { getDefaultEditorValue } from 'editor/constants';
import { Notes } from 'lib/store';

const generateNotes = () => {
  const notes: Notes = {};
  for (let i = 0; i < 10; i++) {
    const id = `note-${i}`;
    notes[id] = {
      id,
      title: `Note ${i}`,
      content: getDefaultEditorValue(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return notes;
};

const notes = generateNotes();

export default notes;
