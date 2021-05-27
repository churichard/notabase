import React, { createRef, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AppLayout from 'components/AppLayout';
import Note from 'components/Note';
import { Note as NoteType } from 'types/supabase';
import { useStore } from 'lib/state';

type Props = {
  initialNotes: Array<NoteType>;
  mainNote: NoteType | null;
  initialStackedNotes: Array<NoteType> | null;
};

export default function NotePage(props: Props) {
  const { initialNotes, mainNote, initialStackedNotes } = props;
  const openNotes = useStore((state) => state.openNotes);
  const setOpenNotes = useStore((state) => state.setOpenNotes);

  useEffect(() => {
    const openNotes = [];
    if (mainNote) {
      openNotes.push({
        note: mainNote,
        ref: createRef<HTMLElement | null>(),
      });
    }
    if (initialStackedNotes) {
      openNotes.push(
        ...initialStackedNotes.map((note) => ({
          note,
          ref: createRef<HTMLElement | null>(),
        }))
      );
    }
    setOpenNotes(openNotes);
  }, [setOpenNotes, mainNote, initialStackedNotes]);

  if (!mainNote) {
    return (
      <>
        <Head>
          <title>Notabase</title>
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
        <title>{mainNote.title}</title>
      </Head>
      <AppLayout initialNotes={initialNotes}>
        <div className="flex overflow-x-auto divide-x">
          {openNotes.length > 0
            ? openNotes.map(({ note, ref }) => (
                <Note
                  key={note.id}
                  ref={(node) => (ref.current = node)}
                  initialNote={note}
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
  query,
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
    .select('id, title')
    .eq('user_id', user.id)
    .order('title');

  // Validate id query param
  const noteId = query.id;
  if (!noteId || typeof noteId !== 'string') {
    return {
      props: {
        initialNotes: notes ?? [],
        mainNote: null,
        initialStackedNotes: null,
      },
    };
  }

  // Get the main note
  const { data: mainNote } = await supabase
    .from<NoteType>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .eq('id', noteId)
    .single();

  // Get stacked notes
  const stackQuery = query.stack;
  let stackedNotes: NoteType[] | null = null;
  if (stackQuery) {
    const stackedNoteIds: string[] = [];
    if (typeof stackQuery === 'string') {
      stackedNoteIds.push(stackQuery);
    } else {
      stackedNoteIds.push(...stackQuery);
    }

    const { data } = await supabase
      .from<NoteType>('notes')
      .select('id, title, content')
      .eq('user_id', user.id)
      .in('id', stackedNoteIds);

    // Make sure stacked notes are sorted in the same order as in the query param
    stackedNotes =
      data?.sort((n1, n2) => {
        return stackedNoteIds.indexOf(n1.id) - stackedNoteIds.indexOf(n2.id);
      }) ?? null;
  }

  return {
    props: {
      initialNotes: notes ?? [],
      mainNote,
      initialStackedNotes: stackedNotes,
    },
  };
};
