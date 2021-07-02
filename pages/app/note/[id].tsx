import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Path } from 'slate';
import AppLayout from 'components/AppLayout';
import Note from 'components/Note';
import type { Note as NoteType } from 'types/supabase';
import { useStore, Notes } from 'lib/store';
import usePrevious from 'utils/usePrevious';
import { queryParamToArray } from 'utils/url';

type Props = {
  initialNotes: Notes;
};

export default function NotePage(props: Props) {
  const { initialNotes } = props;
  const router = useRouter();
  const {
    query: { id: noteId, stack: stackQuery },
    asPath,
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

  const [highlightedPath, setHighlightedPath] = useState<{
    index: number;
    path: Path;
  } | null>(null);

  // Initialize open notes and highlighted path
  useEffect(() => {
    if (!noteId || typeof noteId !== 'string') {
      return;
    }

    const newOpenNoteIds = [noteId, ...queryParamToArray(stackQuery)];
    setOpenNoteIds(newOpenNoteIds);

    const newHighlightedPath = getHighlightedPath(asPath);
    setHighlightedPath(newHighlightedPath);
  }, [setOpenNoteIds, noteId, stackQuery, asPath]);

  useEffect(() => {
    // Scroll the last open note into view if:
    // 1. The last open note id has changed
    // 2. prevOpenNoteIds has length > 0 (ensures that this is not the first render)
    if (
      openNoteIds.length > 0 &&
      prevOpenNoteIds &&
      prevOpenNoteIds.length > 0 &&
      openNoteIds[openNoteIds.length - 1] !==
        prevOpenNoteIds[prevOpenNoteIds.length - 1]
    ) {
      document
        .getElementById(openNoteIds[openNoteIds.length - 1])
        ?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
        });
    }
  }, [openNoteIds, prevOpenNoteIds]);

  if (!noteId || typeof noteId !== 'string') {
    return (
      <>
        <Head>
          <title>Not Found | Notabase</title>
        </Head>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-2xl">
            Whoops&mdash;it doesn&apos;t look like this note exists!
          </p>
          <Link href="/app">
            <a className="mt-6 btn">Go back to my notes</a>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <AppLayout initialNotes={initialNotes}>
        <div className="flex flex-1 overflow-x-auto bg-gray-50">
          {openNoteIds.length > 0
            ? openNoteIds.map((noteId, index) => (
                <Note
                  key={noteId}
                  noteId={noteId}
                  highlightedPath={
                    highlightedPath?.index === index
                      ? highlightedPath.path
                      : undefined
                  }
                />
              ))
            : null}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  // Create admin supabase client on server
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? ''
  );

  // Get authed user
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/login', permanent: false } };
  }

  // Get notes from database
  const { data: notes } = await supabase
    .from<NoteType>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .order('title');

  return {
    props: {
      initialNotes:
        notes?.reduce<Record<NoteType['id'], NoteType>>((acc, note) => {
          acc[note.id] = note;
          return acc;
        }, {}) ?? {},
    },
  };
};

/**
 * Takes in a url with a hash parameter formatted like #1-2,3 (where 1 signifies the open note index,
 * and 2,3 signifies the path to be highlighted). Parses the url and
 * returns the open note index and the path to be highlighted as an object.
 */
const getHighlightedPath = (
  url: string
): { index: number; path: Path } | null => {
  const urlArr = url.split('#');
  if (urlArr.length <= 1) {
    return null;
  }

  const hash = urlArr[urlArr.length - 1];
  const [strIndex, ...strPath] = hash.split(/[-,]+/);

  const index = Number.parseInt(strIndex);
  const path = strPath.map((pathSegment) => Number.parseInt(pathSegment));
  if (
    Number.isNaN(index) ||
    path.length <= 0 ||
    path.some((segment) => Number.isNaN(segment))
  ) {
    return null;
  }

  return { index, path };
};
