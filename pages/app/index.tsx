import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { createClient, User } from '@supabase/supabase-js';
import { Note } from 'types/supabase';
import AppLayout from 'components/AppLayout';

type Props = {
  initialUser: User;
  initialNotes: Array<Note>;
};

export default function AppHome(props: Props) {
  const { initialUser, initialNotes } = props;
  return (
    <>
      <Head>
        <title>Notabase</title>
      </Head>
      <AppLayout initialUser={initialUser} initialNotes={initialNotes}>
        <div className="flex items-center justify-center w-full p-12">
          <p className="text-gray-500">Get started by adding a new note</p>
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
    .from<Note>('notes')
    .select('id, title')
    .eq('user_id', user.id)
    .order('title');

  // Redirect to first note if one exists
  // TODO: maybe we should redirect to the most recent note instead?
  if (notes && notes.length > 0) {
    return {
      props: {},
      redirect: { destination: `/app/note/${notes[0].id}`, permanent: false },
    };
  }

  return { props: { initialUser: user, initialNotes: notes ?? [] } };
};
