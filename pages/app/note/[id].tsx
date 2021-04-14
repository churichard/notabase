import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AppLayout from 'components/AppLayout';
import Note from 'components/Note';
import { Note as NoteType } from 'types/supabase';

type Props = {
  initialNotes: Array<NoteType>;
  currentNote: Omit<NoteType, 'user_id'> | null;
};

export default function NotePage(props: Props) {
  const { initialNotes, currentNote } = props;

  if (!currentNote) {
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
        <title>{currentNote.title}</title>
      </Head>
      <AppLayout initialNotes={initialNotes} currentNoteId={currentNote.id}>
        <Note initialNote={currentNote} />
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

  // Validate query param
  const noteId = query.id;
  if (!noteId || typeof noteId !== 'string') {
    return {
      props: {
        initialNotes: notes ?? [],
        currentNote: null,
      },
    };
  }

  // Get the current note
  const { data: currentNote } = await supabase
    .from<NoteType>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .eq('id', noteId)
    .single();

  return {
    props: {
      initialNotes: notes ?? [],
      currentNote: currentNote
        ? {
            id: currentNote.id,
            title: currentNote.title,
            content: currentNote.content,
          }
        : null,
    },
  };
};
