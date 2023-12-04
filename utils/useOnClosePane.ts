import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { store } from 'lib/store';
import { queryParamToArray } from './url';
import { useCurrentNote } from './useCurrentNote';

export default function useOnClosePane() {
  const currentNote = useCurrentNote();
  const router = useRouter();
  const {
    query: { stack: stackQuery },
  } = router;

  const onClosePane = useCallback(() => {
    const currentNoteIndex = store
      .getState()
      .openNoteIds.findIndex((openNoteId) => openNoteId === currentNote.id);
    const stackedNoteIds = queryParamToArray(stackQuery);

    if (currentNoteIndex < 0) {
      return;
    }

    if (currentNoteIndex === 0) {
      // Changes current note to first note in stack
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            noteId: stackedNoteIds[0],
            stack: stackedNoteIds.slice(1),
          },
        },
        undefined,
        { shallow: true }
      );
    } else {
      // Remove from stacked notes and shallowly route
      stackedNoteIds.splice(
        currentNoteIndex - 1, // Stacked notes don't include the main note
        1
      );
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, stack: stackedNoteIds },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [currentNote.id, stackQuery, router]);

  return onClosePane;
}
