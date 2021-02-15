import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Editor from 'components/editor/Editor';
import supabase from 'lib/supabase';
import Sidebar from 'components/Sidebar';

export default function App() {
  return (
    <>
      <Head>
        <title>Atomic</title>
      </Head>
      <div className="flex">
        <Sidebar />
        <Editor />
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
