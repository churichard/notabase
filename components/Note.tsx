import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { createEditor, Node, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { User } from '@supabase/supabase-js';
import Title from 'components/editor/Title';
import { Note as NoteType } from 'types/supabase';
import useDebounce from 'hooks/useDebounce';
import supabase from 'lib/supabase';
import withBlockBreakout from 'editor/plugins/withBlockBreakout';
import withAutoMarkdown from 'editor/plugins/withAutoMarkdown';
import withLinks from 'editor/plugins/withLinks';

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
  const noteRef = useRef<HTMLDivElement | null>(null);

  const editor = useMemo(
    () =>
      withAutoMarkdown(
        withBlockBreakout(withLinks(withHistory(withReact(createEditor()))))
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
    // If the note id has changed
    if (initialNote.id !== id) {
      // Deselect any current selection
      Transforms.deselect(editor);
      // Scroll to the top of the note
      noteRef.current?.scrollTo(0, 0);
      // Reset the note contents
      setCurrentNote(initialNote);
      setDebouncedNote(initialNote);
    }
  }, [editor, initialNote, debouncedNote, saveNote, setDebouncedNote]);

  return (
    <div ref={noteRef} className="flex flex-col p-12 overflow-y-auto w-192">
      <Title
        className="mb-3"
        value={currentNote.title}
        onChange={(title: string) =>
          setCurrentNote((note) => ({ ...note, title }))
        }
      />
      <Editor
        className="flex-1 pb-112"
        editor={editor}
        value={currentNote.content}
        setValue={(content: Array<Node>) =>
          setCurrentNote((note) => ({ ...note, content }))
        }
      />
    </div>
  );
}
