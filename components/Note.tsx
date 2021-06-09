import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Descendant } from 'slate';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Editor from 'components/editor/Editor';
import Title from 'components/editor/Title';
import useBacklinks from 'editor/useBacklinks';
import { deepEqual, useStore } from 'lib/store';
import type { NoteUpdate } from 'lib/api/updateNote';
import updateDbNote from 'lib/api/updateNote';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import Backlinks from './editor/backlinks/Backlinks';
import NoteHeader from './editor/NoteHeader';

const SYNC_DEBOUNCE_MS = 1000;

const CHECK_VIOLATION_ERROR_CODE = '23514';
const UNIQUE_VIOLATION_ERROR_CODE = '23505';

type Props = {
  noteId: string;
};

export default function Note(props: Props) {
  const { noteId } = props;
  const router = useRouter();

  const note = useStore((state) => state.notes[noteId], deepEqual);
  const updateNote = useStore((state) => state.updateNote);

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

  const { updateBacklinks } = useBacklinks(note.id);

  const onTitleChange = useCallback(
    (title: string) => {
      if (note.title !== title) {
        updateNote({ id: note.id, title });
        setSyncState((syncState) => ({ ...syncState, isTitleSynced: false }));
      }
    },
    [note.id, note.title, updateNote]
  );

  const setEditorValue = useCallback(
    (content: Descendant[]) => {
      if (note.content !== content) {
        updateNote({ id: note.id, content });
        setSyncState((syncState) => ({ ...syncState, isContentSynced: false }));
      }
    },
    [note.id, note.content, updateNote]
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
    note.id,
    note.content,
    note.title,
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
    <ProvideCurrentNote value={note}>
      <div id={note.id} className="flex flex-col flex-shrink-0 border-r w-176">
        <NoteHeader />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col flex-1">
            <Title
              className="px-12 pt-12 pb-1"
              value={note.title}
              onChange={onTitleChange}
            />
            <Editor
              className="flex-1 px-12 pt-2 pb-12"
              value={note.content}
              setValue={setEditorValue}
            />
          </div>
          <Backlinks className="mx-8 mb-12" />
        </div>
      </div>
    </ProvideCurrentNote>
  );
}
