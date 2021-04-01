import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { createEditor, Descendant, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { User } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import Title from 'components/editor/Title';
import { Note as NoteType } from 'types/supabase';
import useDebounce from 'utils/useDebounce';
import withBlockBreakout from 'editor/plugins/withBlockBreakout';
import withAutoMarkdown from 'editor/plugins/withAutoMarkdown';
import withLinks from 'editor/plugins/withLinks';
import updateNote from 'lib/api/updateNote';

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
    content: Descendant[];
  }>(initialNote);
  const [debouncedNote, setDebouncedNote] = useDebounce(currentNote, 500);

  const onTitleChange = useCallback((title: string) => {
    setCurrentNote((note) => ({ ...note, title }));
  }, []);

  const setEditorValue = useCallback(
    (content: Descendant[]) => setCurrentNote((note) => ({ ...note, content })),
    []
  );

  const updateNoteContent = useCallback(
    async (id: string, content: string) => {
      const { error } = await updateNote(user.id, id, { content });

      if (error) {
        toast.error(
          'Something went wrong saving your note. Please try again later.'
        );
      }
    },
    [user.id]
  );

  const updateNoteTitle = useCallback(
    async (id: string, title: string) => {
      const { error } = await updateNote(user.id, id, { title });

      if (error?.code === '23514') {
        toast.error(
          `This note cannot have an empty title. Please use a different title.`
        );
      } else if (error?.code === '23505') {
        toast.error(
          `There's already a note called ${title}. Please use a different title.`
        );
      } else if (error) {
        toast.error(
          'Something went wrong saving your note title. Please try using a different title, or try again later.'
        );
      }
    },
    [user.id]
  );

  // Save the note title in the database if it changes
  useEffect(() => {
    updateNoteTitle(debouncedNote.id, debouncedNote.title);
  }, [updateNoteTitle, debouncedNote.id, debouncedNote.title]);

  // Save the note content in the database if it changes
  useEffect(() => {
    updateNoteContent(debouncedNote.id, JSON.stringify(debouncedNote.content));
  }, [updateNoteContent, debouncedNote.id, debouncedNote.content]);

  // Update the current note if the note id has changed
  useEffect(() => {
    // If the note id has changed
    if (initialNote.id !== debouncedNote.id) {
      // Deselect any current selection
      Transforms.deselect(editor);
      // Scroll to the top of the note
      noteRef.current?.scrollTo(0, 0);
      // Reset the note contents
      setCurrentNote(initialNote);
      setDebouncedNote(initialNote);
    }
  }, [editor, initialNote, debouncedNote.id, setDebouncedNote]);

  return (
    <div ref={noteRef} className="flex flex-col p-12 overflow-y-auto w-192">
      <Title
        className="mb-3"
        value={currentNote.title}
        onChange={onTitleChange}
      />
      <Editor
        className="flex-1 pb-112"
        editor={editor}
        value={currentNote.content}
        setValue={setEditorValue}
      />
    </div>
  );
}
