import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { createEditor, Node, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { User } from '@supabase/supabase-js';
import Title from 'components/editor/Title';
import { Note as NoteType } from 'types/supabase';
import useDebounce from 'hooks/useDebounce';
import supabase from 'lib/supabase';
import { withBlockBreakout, withMarkdownShortcuts } from 'editor/plugins';

// Workaround for Slate bug when hot reloading: https://github.com/ianstormtaylor/slate/issues/3621
const Editor = dynamic(() => import('components/editor/Editor'), {
  ssr: false,
});

type Props = {
  user: User;
  note: NoteType;
};

export default function Note(props: Props) {
  const { user, note } = props;

  const editor = useMemo(
    () =>
      withMarkdownShortcuts(
        withBlockBreakout(withHistory(withReact(createEditor())))
      ),
    []
  );
  const initialNote = useMemo(
    () => ({
      id: note.id,
      title: note.title,
      content: JSON.parse(note.content),
    }),
    [note]
  );
  const [currentNote, setCurrentNote] = useState<{
    id: string;
    title: string;
    content: Array<Node>;
  }>(initialNote);
  const [debouncedNote, setDebouncedNote] = useDebounce(currentNote, 500);

  const saveNote = useCallback(
    async (id: string, title: string, content: string) => {
      await supabase
        .from<NoteType>('notes')
        .update({ title, content })
        .eq('user_id', user.id)
        .eq('id', id);
    },
    [user.id]
  );

  // Save the updated note in the database if it changes
  useEffect(() => {
    const { id, title, content } = debouncedNote;
    saveNote(id, title, JSON.stringify(content));
    if (initialNote.id !== id) {
      // Reset the note contents if the note id has changed
      Transforms.deselect(editor);
      setCurrentNote(initialNote);
      setDebouncedNote(initialNote);
    }
  }, [editor, initialNote, debouncedNote, saveNote, setDebouncedNote]);

  return (
    <div className="flex flex-col p-12 overflow-y-auto w-176">
      <Title
        className="mb-6"
        value={currentNote.title}
        onChange={(title) => setCurrentNote((note) => ({ ...note, title }))}
      />
      <Editor
        className="flex-1 pb-96"
        editor={editor}
        value={currentNote.content}
        setValue={(content) => setCurrentNote((note) => ({ ...note, content }))}
      />
    </div>
  );
}
