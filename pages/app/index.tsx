import React, { useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { User } from '@supabase/supabase-js';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';
import { Note } from 'types/supabase';
import { getNoteTitles } from 'api/useNoteTitles';
import { useAuth } from 'utils/useAuth';

type Props = {
  user: User;
  notes: Array<Note>;
};

export default function AppHome(props: Props) {
  const { user, notes } = props;
  const { setUser } = useAuth();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return (
    <>
      <Head>
        <title>Notabase</title>
      </Head>
      <div className="flex h-screen">
        <Sidebar notes={notes} />
        <div className="flex items-center justify-center w-full p-12">
          <p className="text-gray-500">Get started by adding a new note</p>
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
  const notes = await getNoteTitles(user.id);

  // Redirect to first note if one exists
  if (notes.length > 0) {
    return {
      props: {},
      redirect: { destination: `/app/note/${notes[0].id}`, permanent: false },
    };
  }

  return { props: { user, notes: notes ?? [] } };
}
