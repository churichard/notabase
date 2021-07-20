import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Path } from 'slate';
import { useCurrentNote } from 'utils/useCurrentNote';
import { useStore } from 'lib/store';
import { queryParamToArray } from 'utils/url';

export default function useOnNoteLinkClick() {
  const router = useRouter();
  const {
    query: { stack: stackQuery },
  } = router;
  const currentNote = useCurrentNote();
  const openNoteIds = useStore((state) => state.openNoteIds);
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);

  const onClick = useCallback(
    (noteId: string, highlightedPath?: Path) => {
      /**
       * If the note is already open, scroll it into view
       */
      const index = openNoteIds.findIndex(
        (openNoteId) => openNoteId === noteId
      );
      if (index > -1) {
        const noteElement = document.getElementById(openNoteIds[index]);
        if (noteElement) {
          const notesContainer = noteElement.parentElement;
          const noteWidth = noteElement.offsetWidth;
          notesContainer?.scrollTo({
            left: noteWidth * index, // We assume all the notes are the same width
            behavior: 'smooth',
          });
        }

        if (highlightedPath) {
          // Update highlighted path; scrolling is handled in editor
          router.push({ hash: `${index}-${highlightedPath}` }, undefined, {
            shallow: true,
          });
        }

        return;
      }

      /**
       * If the note is not open, add it to the open notes
       */
      const currentNoteIndex = openNoteIds.findIndex(
        (openNoteId) => openNoteId === currentNote.id
      );
      if (currentNoteIndex < 0) {
        return;
      }

      const newNoteIndex = currentNoteIndex + 1;
      const hash = highlightedPath
        ? `${newNoteIndex}-${highlightedPath}`
        : undefined;

      // Replace the notes after the current note with the new note
      const stackedNoteIds = queryParamToArray(stackQuery);
      stackedNoteIds.splice(
        newNoteIndex - 1, // Stacked notes don't include the main note
        stackedNoteIds.length - (newNoteIndex - 1),
        noteId
      );

      // Open new note (either as a stacked note or as a new page)
      if (isPageStackingOn) {
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, stack: stackedNoteIds },
            hash,
          },
          undefined,
          { shallow: true }
        );
      } else {
        router.push(`/app/note/${noteId}${hash}`);
      }
    },
    [router, openNoteIds, currentNote, stackQuery, isPageStackingOn]
  );

  return onClick;
}
