import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { User } from '@supabase/supabase-js';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';
import Title from 'components/editor/Title';
import { Note } from 'types/supabase';

// Workaround for Slate bug when hot reloading: https://github.com/ianstormtaylor/slate/issues/3621
const Editor = dynamic(() => import('components/editor/Editor'), {
  ssr: false,
});

type Props = {
  user: User;
  notes: Note[];
};

export default function App(props: Props) {
  const { user, notes } = props;
  return (
    <>
      <Head>
        <title>Atomic</title>
      </Head>
      <div className="flex h-screen">
        <Sidebar user={user} notes={notes} />
        <div className="flex flex-col p-12 overflow-y-auto w-176">
          <Title className="mb-6" />
          <Editor className="flex-1" />
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
    .eq('user_id', user.id);

  return { props: { user, notes: notes ?? [] } };
}
