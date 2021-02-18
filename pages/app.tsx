import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';
import Title from 'components/editor/Title';

// Workaround for Slate bug when hot reloading: https://github.com/ianstormtaylor/slate/issues/3621
const Editor = dynamic(() => import('components/editor/Editor'), {
  ssr: false,
});

export default function App() {
  return (
    <>
      <Head>
        <title>Atomic</title>
      </Head>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col p-12 overflow-y-auto w-176">
          <Title className="mb-6" />
          <Editor className="flex-1" />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user } };
}
