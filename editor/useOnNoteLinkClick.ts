import { MouseEvent, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Path } from 'slate';
import { useStore } from 'lib/store';
import { queryParamToArray } from 'utils/url';

export default function useOnNoteLinkClick(currentNoteId: string) {
  const router = useRouter();
  const {
    query: { stack: stackQuery },
  } = router;
  const openNoteIds = useStore((state) => state.openNoteIds);
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);

  const onClick = useCallback(
    (noteId: string, stackNote: boolean, highlightedPath?: Path) => {
      // If stackNote is false, open the note in its own page
      if (!stackNote) {
        const hash = highlightedPath ? `0-${highlightedPath}` : undefined;
        router.push({
          pathname: router.pathname,
          query: { id: noteId },
          hash,
        });
        return;
      }

      // If the note is already open, scroll it into view
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

      // If the note is not open, add it to the open notes after currentNoteId
      const currentNoteIndex = openNoteIds.findIndex(
        (openNoteId) => openNoteId === currentNoteId
      );
      if (currentNoteIndex < 0) {
        console.error(
          `Error: current note ${currentNoteId} is not in open notes`
        );
        return;
      }

      const newNoteIndex = currentNoteIndex + 1;

      // Replace the notes after the current note with the new note
      const stackedNoteIds = queryParamToArray(stackQuery);
      stackedNoteIds.splice(
        newNoteIndex - 1, // Stacked notes don't include the main note
        stackedNoteIds.length - (newNoteIndex - 1),
        noteId
      );

      // Open the note as a stacked note
      const hash = highlightedPath
        ? `${newNoteIndex}-${highlightedPath}`
        : undefined;
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, stack: stackedNoteIds },
          hash,
        },
        undefined,
        { shallow: true }
      );
    },
    [router, openNoteIds, currentNoteId, stackQuery]
  );

  const defaultStackingBehavior = useCallback(
    (e: MouseEvent) =>
      (isPageStackingOn && !e.shiftKey) || (!isPageStackingOn && e.shiftKey),
    [isPageStackingOn]
  );

  return { onClick, defaultStackingBehavior };
}
