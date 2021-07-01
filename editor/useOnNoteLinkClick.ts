import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Path } from 'slate';
import { useAuth } from 'utils/useAuth';
import { useCurrentNote } from 'utils/useCurrentNote';
import { useStore } from 'lib/store';

export default function useOnNoteLinkClick() {
  const { user } = useAuth();
  const router = useRouter();
  const currentNote = useCurrentNote();
  const openNotes = useStore((state) => state.openNotes);
  const updateOpenNote = useStore((state) => state.updateOpenNote);
  const setOpenNotes = useStore((state) => state.setOpenNotes);

  const onClick = useCallback(
    (noteId: string, highlightedPath?: Path) => {
      // If the note is already open, scroll it into view
      const openNote = openNotes.find((openNote) => openNote.id === noteId);
      if (openNote) {
        document.getElementById(openNote.id)?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
        });

        // Update highlighted path
        if (highlightedPath) {
          updateOpenNote(openNote.id, { highlightedPath });
        }

        return;
      }

      // If the note is not open, add it to the open notes
      const currentNoteIndex = openNotes.findIndex(
        (openNote) => openNote.id === currentNote.id
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

      // Add note to open notes
      setOpenNotes([{ id: noteId, highlightedPath }], currentNoteIndex + 1);
    },
    [user, router, currentNote.id, openNotes, setOpenNotes, updateOpenNote]
  );

  return onClick;
}
