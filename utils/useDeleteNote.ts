import { useCallback } from 'react';
import { useRouter } from 'next/router';
import deleteBacklinks from 'editor/backlinks/deleteBacklinks';
import deleteNote from 'lib/api/deleteNote';
import { store, useStore } from 'lib/store';

export default function useDeleteNote(noteId: string) {
  const router = useRouter();

  const openNoteIds = useStore((state) => state.openNoteIds);

  const onDeleteClick = useCallback(async () => {
    const deletedNoteIndex = openNoteIds.findIndex(
      (openNoteId) => openNoteId === noteId
    );

    if (deletedNoteIndex !== -1) {
      // Redirect if one of the notes that was deleted was open
      const noteIds = Object.keys(store.getState().notes);
      // If there are other notes to redirect to, redirect to the first one
      if (noteIds.length > 1) {
        for (const id of noteIds) {
          // We haven't deleted the note yet, so we need to check the id
          if (noteId !== id) {
            router.push(`/app/note/${id}`, undefined, { shallow: true });
            break;
          }
        }
      } else {
        // No note ids to redirect to, redirect to app
        router.push('/app');
      }
    }

    await deleteNote(noteId);
    await deleteBacklinks(noteId);
  }, [router, noteId, openNoteIds]);

  return onDeleteClick;
}
