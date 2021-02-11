import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Editor from 'components/Editor';
import supabase from 'lib/supabase';

export default function App() {
  return (
    <>
      <Head>
        <title>Atomic</title>
      </Head>
      <div>
        <h1>Atomic App</h1>
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
