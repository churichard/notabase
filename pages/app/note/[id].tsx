import { useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Path } from 'slate';
import AppLayout from 'components/AppLayout';
import Note from 'components/Note';
import type { Note as NoteType } from 'types/supabase';
import type { Notes, OpenNote } from 'lib/store';
import { useStore } from 'lib/store';
import usePrevious from 'utils/usePrevious';

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

  const openNotes = useStore((state) => state.openNotes);
  const updateOpenNote = useStore((state) => state.updateOpenNote);
  const setOpenNotes = useStore((state) => state.setOpenNotes);
  const prevOpenNotes = usePrevious(openNotes);

  const pageTitle = useStore((state) => {
    if (!noteId || typeof noteId !== 'string' || !state.notes[noteId]?.title) {
      return 'Notabase';
    }
    return state.notes[noteId].title;
  });

  // Initialize open notes
  useEffect(() => {
    if (
      !noteId ||
      typeof noteId !== 'string' ||
      (openNotes.length > 0 && openNotes[0].id === noteId)
    ) {
      return;
    }

    const initialOpenNotes: OpenNote[] = [];
    initialOpenNotes.push({ id: noteId });

    if (stackQuery) {
      const stackedNoteIds: string[] = [];
      if (typeof stackQuery === 'string') {
        stackedNoteIds.push(stackQuery);
      } else {
        stackedNoteIds.push(...stackQuery);
      }
      initialOpenNotes.push(
        ...stackedNoteIds.map((noteId) => ({ id: noteId }))
      );
    }

    setOpenNotes(initialOpenNotes);
  }, [setOpenNotes, noteId, stackQuery, openNotes, asPath]);

  // Update highlighted path based on url hash
  useEffect(() => {
    if (!noteId || typeof noteId !== 'string') {
      return;
    }
    updateOpenNote(noteId, {
      highlightedPath: getHighlightedPathFromUrl(asPath),
    });
  }, [noteId, asPath, updateOpenNote]);

  useEffect(() => {
    // Scroll the last open note into view if:
    // 1. The last open note has changed
    // 2. prevOpenNotes has length > 0 (ensures that this is not the first render)
    if (
      openNotes.length > 0 &&
      prevOpenNotes &&
      prevOpenNotes.length > 0 &&
      openNotes[openNotes.length - 1].id !==
        prevOpenNotes[prevOpenNotes.length - 1].id
    ) {
      document
        .getElementById(openNotes[openNotes.length - 1].id)
        ?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
        });
    }
  }, [openNotes, prevOpenNotes]);

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
          {openNotes.length > 0
            ? openNotes.map((note) => (
                <Note
                  key={note.id}
                  noteId={note.id}
                  highlightedPath={note.highlightedPath}
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

const getHighlightedPathFromUrl = (url: string): Path | undefined => {
  const arr = url.split('#');
  if (arr.length <= 1) {
    return;
  }

  const hash = arr[arr.length - 1];
  const path = hash
    .split(',')
    .map((pathSegment) => Number.parseInt(pathSegment));

  if (path.some((segment) => Number.isNaN(segment))) {
    return;
  }

  return path;
};
