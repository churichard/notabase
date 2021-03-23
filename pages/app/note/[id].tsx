import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import useSWR from 'swr';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';
import Note from 'components/Note';
import { Note as NoteType } from 'types/supabase';
import { getNoteTitles, GET_NOTE_TITLES_KEY } from 'api/note';

type Props = {
  user: User;
  notes: Array<NoteType>;
  note?: NoteType;
};

export default function NotePage(props: Props) {
  const { user, note } = props;
  const { data: notes } = useSWR(GET_NOTE_TITLES_KEY, {
    initialData: props.notes,
  });

  if (!note) {
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
        <title>{note.title}</title>
      </Head>
      <div className="flex h-screen">
        <Sidebar user={user} notes={notes} currentNoteId={note.id} />
        <Note user={user} note={note} />
      </div>
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
  const { data: notes } = await getNoteTitles(user.id);

  // Validate query param
  const noteId = query.id;
  if (!noteId || typeof noteId !== 'string') {
    return { props: { user, notes: notes ?? [], note: null } };
  }

  // Get the current note
  const { data: note } = await supabase
    .from<NoteType>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .eq('id', noteId)
    .single();

  return { props: { user, notes: notes ?? [], note } };
}
