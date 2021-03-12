import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { User } from '@supabase/supabase-js';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';
import { Note } from 'types/supabase';

type Props = {
  user: User;
  notes: Array<Note>;
};

export default function AppHome(props: Props) {
  const { user, notes } = props;

  return (
    <>
      <Head>
        <title>Notabase</title>
      </Head>
      <div className="flex h-screen">
        <Sidebar user={user} notes={notes} />
        <div className="flex items-center justify-center w-full p-12">
          <p className="text-gray-500">
            Get started by adding a new note or selecting an existing one
          </p>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  // Get authed user
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/login', permanent: false } };
  }

  // Get notes from database
  const { data: notes } = await supabase
    .from<Note>('notes')
    .select('id, title')
    .eq('user_id', user.id)
    .order('title');

  // Redirect to first note if one exists
  if (notes && notes.length > 0) {
    return {
      props: {},
      redirect: { destination: `/app/note/${notes[0].id}`, permanent: false },
    };
  }

  return { props: { user, notes: notes ?? [] } };
}
