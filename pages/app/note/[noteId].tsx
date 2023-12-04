import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Path } from 'slate';
import Note from 'components/Note';
import { useStore } from 'lib/store';
import usePrevious from 'utils/usePrevious';
import { queryParamToArray } from 'utils/url';
import useBlockBacklinks from 'editor/backlinks/useBlockBacklinks';
import getHighlightedPath from 'utils/getHighlightedPath';
import NotePermissionError from 'components/NotePermissionError';

export default function NotePage() {
  const router = useRouter();
  const {
    query: { noteId, stack: stackQuery },
  } = router;

  const openNoteIds = useStore((state) => state.openNoteIds);
  const setOpenNoteIds = useStore((state) => state.setOpenNoteIds);
  const prevOpenNoteIds = usePrevious(openNoteIds);

  const pageTitle = useStore((state) => {
    if (!noteId || typeof noteId !== 'string' || !state.notes[noteId]?.title) {
      return 'Notabase';
    }
    return state.notes[noteId].title;
  });

  useBlockBacklinks();

  const [highlightedPath, setHighlightedPath] = useState<{
    index: number;
    path: Path;
  } | null>(null);

  // Initialize open notes and highlighted path
  useEffect(() => {
    if (!noteId || typeof noteId !== 'string') {
      return;
    }

    // Initialize open note ids
    const newOpenNoteIds = [noteId, ...queryParamToArray(stackQuery)];
    setOpenNoteIds(newOpenNoteIds);

    // We use router.asPath specifically so we handle any route change (even if asPath is the same)
    const newHighlightedPath = getHighlightedPath(router.asPath);
    setHighlightedPath(newHighlightedPath);
  }, [setOpenNoteIds, router, noteId, stackQuery]);

  useEffect(() => {
    // Scroll the last open note into view if:
    // 1. The last open note id has changed
    // 2. prevOpenNoteIds has length > 0 (ensures that this is not the first render)
    // 3. highlightedPath is not set (if it is, scrolling will be handled by the editor component)
    if (
      openNoteIds.length > 0 &&
      prevOpenNoteIds &&
      prevOpenNoteIds.length > 0 &&
      openNoteIds[openNoteIds.length - 1] !==
        prevOpenNoteIds[prevOpenNoteIds.length - 1] &&
      !highlightedPath
    ) {
      document
        .getElementById(openNoteIds[openNoteIds.length - 1])
        ?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
        });
    }
  }, [openNoteIds, prevOpenNoteIds, highlightedPath]);

  if (!noteId || typeof noteId !== 'string') {
    return (
      <>
        <Head>
          <title>Not Found | Notabase</title>
        </Head>
        <NotePermissionError className="flex h-screen flex-1 flex-col items-center justify-center p-4" />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="flex flex-1 divide-x divide-gray-200 overflow-x-auto dark:divide-gray-700">
        {openNoteIds.length > 0
          ? openNoteIds.map((noteId, index) => (
              <Note
                key={noteId}
                noteId={noteId}
                className="sticky left-0"
                highlightedPath={
                  highlightedPath?.index === index
                    ? highlightedPath.path
                    : undefined
                }
              />
            ))
          : null}
      </div>
    </>
  );
}
