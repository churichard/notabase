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
      const newNoteId = Object.keys(store.getState().notes)[0];
      router.push(`/app/note/${newNoteId}`, undefined, { shallow: true });
    }

    await deleteNote(noteId);
    await deleteBacklinks(noteId);
  }, [router, noteId, openNoteIds]);

  return onDeleteClick;
}
