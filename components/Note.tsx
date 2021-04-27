import React, {
  ForwardedRef,
  forwardRef,
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
import useBacklinks from 'editor/useBacklinks';
import withBlockBreakout from 'editor/plugins/withBlockBreakout';
import withAutoMarkdown from 'editor/plugins/withAutoMarkdown';
import withLinks from 'editor/plugins/withLinks';
import updateNote from 'lib/api/updateNote';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import Backlinks from './editor/Backlinks';

const SYNC_DEBOUNCE_MS = 1000;

const CHECK_VIOLATION_ERROR_CODE = '23514';
const UNIQUE_VIOLATION_ERROR_CODE = '23505';

// Workaround for Slate bug when hot reloading: https://github.com/ianstormtaylor/slate/issues/3621
const Editor = dynamic(() => import('components/editor/Editor'), {
  ssr: false,
});

type Props = {
  initialNote: NoteType;
};

function Note(props: Props, ref: ForwardedRef<HTMLDivElement>) {
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
  const [currentNote, setCurrentNote] = useState<NoteType>(initialNote);

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

  const handleNoteUpdate = useCallback(
    async (id: string, note: Partial<NoteType>) => {
      const { error } = await updateNote(id, note);

      if (error) {
        switch (error.code) {
          case CHECK_VIOLATION_ERROR_CODE:
            toast.error(
              `This note cannot have an empty title. Please use a different title.`
            );
            return;
          case UNIQUE_VIOLATION_ERROR_CODE:
            toast.error(
              `There's already a note called ${note.title}. Please use a different title.`
            );
            return;
          default:
            toast.error(
              'Something went wrong saving your note. Please try again later.'
            );
            return;
        }
      }
      if (note.title) {
        await updateBacklinks(note.title);
      }
      setSyncState({ isTitleSynced: true, isContentSynced: true });
    },
    [updateBacklinks]
  );

  // Save the note in the database if it changes and it hasn't been saved yet
  useEffect(() => {
    const newNote: Partial<NoteType> = {};
    if (!syncState.isContentSynced) {
      newNote.content = currentNote.content;
    }
    if (!syncState.isTitleSynced) {
      newNote.title = currentNote.title;
    }

    if (Object.keys(newNote).length !== 0) {
      const handler = setTimeout(
        () => handleNoteUpdate(currentNote.id, newNote),
        SYNC_DEBOUNCE_MS
      );
      return () => clearTimeout(handler);
    }
  }, [
    syncState.isContentSynced,
    syncState.isTitleSynced,
    currentNote.id,
    currentNote.content,
    currentNote.title,
    handleNoteUpdate,
  ]);

  // Update the current note if the note id has changed
  useEffect(() => {
    // If the note id has changed
    if (initialNote.id !== currentNote.id) {
      // Deselect any current selection
      Transforms.deselect(editor);
      // Scroll to the top of the note
      noteRef.current?.scrollTo(0, 0);
      // Reset the note contents
      setCurrentNote(initialNote);
    }
  }, [editor, initialNote, currentNote.id]);

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
      <div
        ref={(node) => {
          noteRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className="flex flex-col flex-shrink-0 overflow-y-auto w-176"
      >
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

export default forwardRef<HTMLDivElement, Props>(Note);
