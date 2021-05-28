import React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AuthForm from 'components/AuthForm';

export default function Login() {
  return (
    <>
      <Head>
        <title>Log in | Notabase</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container p-8 md:p-24">
          <div className="mx-auto card md:p-12">
            <p className="pb-6 -mt-2 text-xl text-center">Log in to Notabase</p>
            <AuthForm />
          </div>
          <p className="mt-4 text-sm text-center text-gray-700">
            Don&apos;t have an account?{' '}
            <Link href="/signup">
              <a className="text-primary-600 hover:text-primary-700">Sign up</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> =
  async ({ req }) => {
    // Create admin supabase client on server
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_KEY ?? ''
    );

    // Get authed user
    const { user } = await supabase.auth.api.getUserByCookie(req);
    if (user) {
      return { props: {}, redirect: { destination: '/app', permanent: false } };
    }

    return { props: {} };
  };
