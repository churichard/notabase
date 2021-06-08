import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Descendant } from 'slate';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Editor from 'components/editor/Editor';
import Title from 'components/editor/Title';
import type { Note as NoteType } from 'types/supabase';
import useBacklinks from 'editor/useBacklinks';
import type { Store } from 'lib/store';
import type { NoteUpdate } from 'lib/api/updateNote';
import updateNote from 'lib/api/updateNote';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import Backlinks from './editor/Backlinks';
import NoteHeader from './editor/NoteHeader';

const SYNC_DEBOUNCE_MS = 1000;

const CHECK_VIOLATION_ERROR_CODE = '23514';
const UNIQUE_VIOLATION_ERROR_CODE = '23505';

type Props = {
  currentNote: NoteType;
  setCurrentNote: Store['updateNote'];
};

export default function Note(props: Props) {
  const { currentNote, setCurrentNote } = props;
  const router = useRouter();

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
        setCurrentNote({ id: currentNote.id, title });
        setSyncState((syncState) => ({ ...syncState, isTitleSynced: false }));
      }
    },
    [currentNote.id, currentNote.title, setCurrentNote]
  );

  const setEditorValue = useCallback(
    (content: Descendant[]) => {
      if (currentNote.content !== content) {
        setCurrentNote({ id: currentNote.id, content });
        setSyncState((syncState) => ({ ...syncState, isContentSynced: false }));
      }
    },
    [currentNote.id, currentNote.content, setCurrentNote]
  );

  const handleNoteUpdate = useCallback(
    async (note: NoteUpdate) => {
      const { error } = await updateNote(note);

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
    const newNote: NoteUpdate = { id: currentNote.id };
    if (!syncState.isContentSynced) {
      newNote.content = currentNote.content;
    }
    if (!syncState.isTitleSynced) {
      newNote.title = currentNote.title;
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
    currentNote.id,
    currentNote.content,
    currentNote.title,
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

  return (
    <ProvideCurrentNote value={currentNote}>
      <div
        id={currentNote.id}
        className="flex flex-col flex-shrink-0 border-r w-176"
      >
        <NoteHeader />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col flex-1">
            <Title
              className="px-12 pt-12 pb-1"
              value={currentNote.title}
              onChange={onTitleChange}
            />
            <Editor
              className="flex-1 px-12 pt-2 pb-12"
              value={currentNote.content}
              setValue={setEditorValue}
            />
          </div>
          <Backlinks className="mx-8 mb-12" />
        </div>
      </div>
    </ProvideCurrentNote>
  );
}
