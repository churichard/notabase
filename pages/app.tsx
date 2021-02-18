import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Editor from 'components/editor/Editor';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';
import Title from 'components/editor/Title';

export default function App() {
  return (
    <>
      <Head>
        <title>Atomic</title>
      </Head>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col p-12 w-176">
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
