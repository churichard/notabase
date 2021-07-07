import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Descendant, Path } from 'slate';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Editor from 'components/editor/Editor';
import Title from 'components/editor/Title';
import useBacklinks from 'editor/useBacklinks';
import { deepEqual, store, useStore } from 'lib/store';
import type { NoteUpdate } from 'lib/api/updateNote';
import updateDbNote from 'lib/api/updateNote';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import { caseInsensitiveStringEqual } from 'utils/string';
import { Note as NoteType } from 'types/supabase';
import Backlinks from './editor/backlinks/Backlinks';
import NoteHeader from './editor/NoteHeader';
import ErrorBoundary from './ErrorBoundary';

const SYNC_DEBOUNCE_MS = 1000;

const CHECK_VIOLATION_ERROR_CODE = '23514';
const UNIQUE_VIOLATION_ERROR_CODE = '23505';

type Props = {
  noteId: string;
  highlightedPath?: Path;
};

export default function Note(props: Props) {
  const { noteId, highlightedPath } = props;
  const router = useRouter();

  const note = useStore<NoteType | undefined>(
    (state) => state.notes[noteId],
    deepEqual
  );
  const updateNote = useStore((state) => state.updateNote);

  // Having a separate note title state makes it so that the title can be a "staging" area
  // where it is possible for it to be empty, yet have the actual note title be something like "Untitled"
  const [noteTitle, setNoteTitle] = useState(note?.title ?? '');
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

  const { updateBacklinks } = useBacklinks(noteId);

  const onTitleChange = useCallback(
    (title: string) => {
      if (note && note.title !== title) {
        setNoteTitle(title);
        // Only update note title in storage if there isn't already a note with that title
        const newTitle = title || getUntitledTitle(note.id);
        const notesArr = Object.values(store.getState().notes);
        if (
          notesArr.findIndex((note) =>
            caseInsensitiveStringEqual(note.title, title)
          ) === -1
        ) {
          updateNote({ id: note.id, title: newTitle });
          setSyncState((syncState) => ({ ...syncState, isTitleSynced: false }));
        } else {
          toast.error(
            `There's already a note called ${title}. Please use a different title.`
          );
        }
      }
    },
    [note, updateNote]
  );

  const setEditorValue = useCallback(
    (content: Descendant[]) => {
      if (note && note.content !== content) {
        updateNote({ id: note.id, content });
        setSyncState((syncState) => ({ ...syncState, isContentSynced: false }));
      }
    },
    [note, updateNote]
  );

  const handleNoteUpdate = useCallback(
    async (note: NoteUpdate) => {
      const { error } = await updateDbNote(note);

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
    if (!note) {
      return;
    }

    const newNote: NoteUpdate = { id: note.id };
    if (!syncState.isContentSynced) {
      newNote.content = note.content;
    }
    if (!syncState.isTitleSynced) {
      newNote.title = note.title;
    }

    if (newNote.title || newNote.content) {
      const handler = setTimeout(
        () => handleNoteUpdate(newNote),
        SYNC_DEBOUNCE_MS
      );
      return () => clearTimeout(handler);
    }
  }, [
    syncState.isContentSynced,
    syncState.isTitleSynced,
    note,
    handleNoteUpdate,
  ]);

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

  const noteContainerClassName =
    'flex flex-col flex-shrink-0 md:flex-shrink w-full bg-white';
  const errorContainerClassName = `${noteContainerClassName} items-center justify-center h-full`;

  if (!note) {
    return (
      <div className={errorContainerClassName}>
        <p>Whoops&mdash;it doesn&apos;t look like this note exists!</p>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className={errorContainerClassName}>
          <p>An unexpected error occurred when rendering this note.</p>
        </div>
      }
    >
      <ProvideCurrentNote value={note}>
        <div id={note.id} className={noteContainerClassName}>
          <NoteHeader />
          <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
            <div className="flex flex-col flex-1 w-full mx-auto md:w-128 lg:w-160 xl:w-192">
              <Title
                className="px-12 pt-12 pb-1"
                value={noteTitle}
                onChange={onTitleChange}
              />
              <Editor
                className="flex-1 px-12 pt-2 pb-12"
                value={note.content}
                setValue={setEditorValue}
                highlightedPath={highlightedPath}
              />
              <Backlinks className="mx-8 mb-12" />
            </div>
          </div>
        </div>
      </ProvideCurrentNote>
    </ErrorBoundary>
  );
}

// Get a unique "Untitled" title, ignoring the specified noteId.
const getUntitledTitle = (noteId: string) => {
  const title = 'Untitled';

  const getResult = () => (suffix > 0 ? `${title} ${suffix}` : title);

  let suffix = 0;
  const notesArr = Object.values(store.getState().notes);
  while (
    notesArr.findIndex(
      (note) =>
        note.id !== noteId &&
        caseInsensitiveStringEqual(note.title, getResult())
    ) > -1
  ) {
    suffix += 1;
  }

  return getResult();
};
