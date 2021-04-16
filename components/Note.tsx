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
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Title from 'components/editor/Title';
import { Note as NoteType } from 'types/supabase';
import useDebounce from 'utils/useDebounce';
import useBacklinks from 'editor/useBacklinks';
import withBlockBreakout from 'editor/plugins/withBlockBreakout';
import withAutoMarkdown from 'editor/plugins/withAutoMarkdown';
import withLinks from 'editor/plugins/withLinks';
import updateNote from 'lib/api/updateNote';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import Backlinks from './editor/Backlinks';

const CHECK_VIOLATION_ERROR_CODE = '23514';
const UNIQUE_VIOLATION_ERROR_CODE = '23505';

// Workaround for Slate bug when hot reloading: https://github.com/ianstormtaylor/slate/issues/3621
const Editor = dynamic(() => import('components/editor/Editor'), {
  ssr: false,
});

type NoteState = Omit<NoteType, 'user_id'>;
type Props = {
  initialNote: NoteState;
};

export default function Note(props: Props) {
  const { initialNote } = props;
  const router = useRouter();
  const noteRef = useRef<HTMLDivElement | null>(null);

  const editor = useMemo(
    () =>
      withAutoMarkdown(
        withBlockBreakout(withLinks(withHistory(withReact(createEditor()))))
      ),
    []
  );
  const [currentNote, setCurrentNote] = useState<Omit<NoteType, 'user_id'>>(
    initialNote
  );

  const [syncState, setSyncState] = useState<{
    isTitleSynced: boolean;
    isContentSynced: boolean;
  }>({
    isTitleSynced: true,
    isContentSynced: true,
  });
  const isSynced = useMemo(
    () => syncState.isTitleSynced && syncState.isContentSynced,
    [syncState]
  );
  const [debouncedNote, setDebouncedNote] = useDebounce(currentNote, 1000);

  const { updateBacklinks } = useBacklinks(currentNote.id);

  const onTitleChange = useCallback(
    (title: string) => {
      if (currentNote.title !== title) {
        setCurrentNote((note) => ({ ...note, title }));
        setSyncState((syncState) => ({ ...syncState, isTitleSynced: false }));
      }
    },
    [currentNote.title]
  );

  const setEditorValue = useCallback(
    (content: Descendant[]) => {
      if (currentNote.content !== content) {
        setCurrentNote((note) => ({ ...note, content }));
        setSyncState((syncState) => ({ ...syncState, isContentSynced: false }));
      }
    },
    [currentNote.content]
  );

  const updateNoteContent = useCallback(
    async (id: string, content: Descendant[]) => {
      const { error } = await updateNote(id, { content });

      if (error) {
        toast.error(
          'Something went wrong saving your note. Please try again later.'
        );
        return;
      }

      setSyncState((syncState) => ({ ...syncState, isContentSynced: true }));
    },
    []
  );

  const updateNoteTitle = useCallback(
    async (id: string, title: string) => {
      const { error } = await updateNote(id, { title });

      if (error) {
        switch (error.code) {
          case CHECK_VIOLATION_ERROR_CODE:
            toast.error(
              `This note cannot have an empty title. Please use a different title.`
            );
            return;
          case UNIQUE_VIOLATION_ERROR_CODE:
            toast.error(
              `There's already a note called ${title}. Please use a different title.`
            );
            return;
          default:
            toast.error(
              'Something went wrong saving your note title. Please try using a different title, or try again later.'
            );
            return;
        }
      }

      await updateBacklinks(title);
      setSyncState((syncState) => ({ ...syncState, isTitleSynced: true }));
    },
    [updateBacklinks]
  );

  // Save the note title in the database if it changes and it hasn't been saved yet
  useEffect(() => {
    if (currentNote.title === debouncedNote.title && !syncState.isTitleSynced) {
      updateNoteTitle(debouncedNote.id, debouncedNote.title);
    }
  }, [
    updateNoteTitle,
    currentNote.title,
    debouncedNote.id,
    debouncedNote.title,
    syncState.isTitleSynced,
  ]);

  // Save the note content in the database if it changes and it hasn't been saved yet
  useEffect(() => {
    if (
      currentNote.content === debouncedNote.content &&
      !syncState.isContentSynced
    ) {
      updateNoteContent(debouncedNote.id, debouncedNote.content);
    }
  }, [
    updateNoteContent,
    currentNote.content,
    debouncedNote.id,
    debouncedNote.content,
    syncState.isContentSynced,
  ]);

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

  // Prompt the user with a dialog box about unsaved changes if they navigate away
  useEffect(() => {
    const warningText =
      'You have unsaved changes — are you sure you wish to leave this page?';

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (isSynced) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = () => {
      if (isSynced) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [router, isSynced]);

  return (
    <ProvideCurrentNote value={currentNote}>
      <div ref={noteRef} className="flex flex-col overflow-y-auto w-192">
        <div className="flex flex-col flex-1">
          <Title
            className="px-12 pt-12 pb-1"
            value={currentNote.title}
            onChange={onTitleChange}
          />
          <Editor
            className="flex-1 px-12 pt-2 pb-12"
            editor={editor}
            value={currentNote.content}
            setValue={setEditorValue}
          />
        </div>
        <Backlinks className="mx-8 mb-12" />
      </div>
    </ProvideCurrentNote>
  );
}
