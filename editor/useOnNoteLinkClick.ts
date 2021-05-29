import { createRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'utils/useAuth';
import { useCurrentNote } from 'utils/useCurrentNote';
import { useStore } from 'lib/store';

const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  inline: 'center',
};

export default function useOnNoteLinkClick() {
  const { user } = useAuth();
  const router = useRouter();
  const currentNote = useCurrentNote();
  const openNotes = useStore((state) => state.openNotes);
  const setOpenNotes = useStore((state) => state.setOpenNotes);

  const onClick = useCallback(
    (noteId: string) => {
      // If the note is already open, scroll it into view
      const openNote = openNotes.find(({ id }) => id === noteId);
      if (openNote) {
        openNote.ref.current?.scrollIntoView(SCROLL_OPTIONS);
        return;
      }

      // If the note is not open: fetch it, add it to the open notes, and scroll it into view
      const currentNoteIndex = openNotes.findIndex(
        ({ id }) => id === currentNote.id
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

      // Add note to open notes and scroll it into view
      const ref = createRef<HTMLElement | null>();
      const newNote = { id: noteId, ref };
      setOpenNotes([newNote], currentNoteIndex + 1);
      ref.current?.scrollIntoView(SCROLL_OPTIONS); // TODO: fix scroll into view
    },
    [user, router, currentNote.id, openNotes, setOpenNotes]
  );

  return onClick;
}
