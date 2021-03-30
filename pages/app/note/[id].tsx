import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import supabase from 'lib/supabase';
import Note from 'components/Note';
import { Note as NoteType } from 'types/supabase';
import { getNoteTitles } from 'lib/api/useNoteTitles';
import AppLayout from 'components/AppLayout';

type Props = {
  initialUser: User;
  initialNotes: Array<NoteType>;
  currentNote?: NoteType;
};

export default function NotePage(props: Props) {
  const { initialUser, initialNotes, currentNote } = props;

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
      <AppLayout
        initialUser={initialUser}
        initialNotes={initialNotes}
        currentNote={currentNote}
      >
        <Note user={initialUser} note={currentNote} />
      </AppLayout>
    </>
  );
}

export async function getServerSideProps({
  req,
  query,
}: GetServerSidePropsContext) {
  // Get authed user
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/login', permanent: false } };
  }

  // Get notes from database
  const notes = await getNoteTitles(user.id);

  // Validate query param
  const noteId = query.id;
  if (!noteId || typeof noteId !== 'string') {
    return { props: { user, notes, note: null } };
  }

  // Get the current note
  const { data: currentNote } = await supabase
    .from<NoteType>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .eq('id', noteId)
    .single();

  return { props: { initialUser: user, initialNotes: notes, currentNote } };
}
