import { useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import AppLayout from 'components/AppLayout';
import Note from 'components/Note';
import type { Note as NoteType } from 'types/supabase';
import type { Notes } from 'lib/store';
import { useStore, shallowEqual } from 'lib/store';
import usePrevious from 'utils/usePrevious';

type Props = {
  initialNotes: Notes;
};

export default function NotePage(props: Props) {
  const { initialNotes } = props;
  const {
    query: { id: noteId, stack: stackQuery },
  } = useRouter();

  const openNoteIds = useStore((state) => state.openNoteIds, shallowEqual);
  const setOpenNoteIds = useStore((state) => state.setOpenNoteIds);
  const prevOpenNoteIds = usePrevious(openNoteIds);

  const pageTitle = useStore((state) => {
    if (!noteId || typeof noteId !== 'string' || !state.notes[noteId]?.title) {
      return 'Notabase';
    }
    return state.notes[noteId].title;
  });

  useEffect(() => {
    if (!noteId || typeof noteId !== 'string') {
      return;
    }

    const openNoteIds = [];
    openNoteIds.push(noteId);

    if (stackQuery) {
      const stackedNoteIds: string[] = [];
      if (typeof stackQuery === 'string') {
        stackedNoteIds.push(stackQuery);
      } else {
        stackedNoteIds.push(...stackQuery);
      }
      openNoteIds.push(...stackedNoteIds);
    }

    setOpenNoteIds(openNoteIds);
  }, [setOpenNoteIds, noteId, stackQuery]);

  useEffect(() => {
    // Scroll the last open note into view if:
    // 1. The last open note has changed
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
        <div className="flex overflow-x-auto">
          {openNoteIds.length > 0
            ? openNoteIds.map((noteId) => <Note key={noteId} noteId={noteId} />)
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
