import React from 'react';
import Head from 'next/head';
import useRequireAuth from 'auth/useRequireAuth';
import Spinner from 'components/Spinner';

export default function App() {
  const user = useRequireAuth();

  if (!user) {
    return (
      <>
        <Head>
          <title>Redirecting... | Atomic</title>
        </Head>
        <div className="flex items-center justify-center w-screen h-screen">
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Atomic</title>
      </Head>
      <div>
        <h1>Atomic App</h1>
      </div>
    </>
  );
}
