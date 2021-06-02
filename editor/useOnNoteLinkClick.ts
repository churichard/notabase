import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'utils/useAuth';
import { useCurrentNote } from 'utils/useCurrentNote';
import { shallowEqual, useStore } from 'lib/store';

export default function useOnNoteLinkClick() {
  const { user } = useAuth();
  const router = useRouter();
  const currentNote = useCurrentNote();
  const openNoteIds = useStore((state) => state.openNoteIds, shallowEqual);
  const setOpenNoteIds = useStore((state) => state.setOpenNoteIds);

  const onClick = useCallback(
    (noteId: string) => {
      // If the note is already open, scroll it into view
      const openNoteId = openNoteIds.find(
        (openNoteId) => openNoteId === noteId
      );
      if (openNoteId) {
        document.getElementById(openNoteId)?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
        });
        return;
      }

      // If the note is not open, add it to the open note ids
      const currentNoteIndex = openNoteIds.findIndex(
        (openNoteId) => openNoteId === currentNote.id
      );
      if (currentNoteIndex < 0 || !user) {
        return;
      }

      // Update stack query param shallowly
      const stackedNoteIds: string[] = [];
      const stackQuery = router.query.stack;
      if (stackQuery) {
        if (typeof stackQuery === 'string') {
          stackedNoteIds.push(stackQuery);
        } else {
          stackedNoteIds.push(...stackQuery);
        }
      }
      // Replace the notes after the current note with the new note
      stackedNoteIds.splice(
        currentNoteIndex, // Stacked notes don't include the current note
        stackedNoteIds.length - currentNoteIndex,
        noteId
      );
      // Push stack query param into router
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, stack: stackedNoteIds },
        },
        undefined,
        { shallow: true }
      );

      // Add note to open note ids
      setOpenNoteIds([noteId], currentNoteIndex + 1);
    },
    [user, router, currentNote.id, openNoteIds, setOpenNoteIds]
  );

  return onClick;
}
