import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import supabase from 'lib/supabase';

export default function Signup() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);

    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (user) {
      router.push('/app');
    } else if (error) {
      toast.error(error.message);
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Head>
        <title>Log in | Atomic</title>
      </Head>
      <div className="min-h-screen bg-blue-50">
        <div className="container p-8 md:p-24">
          <div className="mx-auto card md:p-12">
            <p className="pb-6 -mt-2 text-xl text-center">Log in to Atomic</p>
            <form onSubmit={onLogin}>
              <div>
                <label htmlFor="email" className="block text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  className="w-full mt-2 input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="password" className="block text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full mt-2 input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <button
                className={`w-full mt-6 btn ${
                  isLoggingIn && 'opacity-50 cursor-wait'
                }`}
                disabled={isLoggingIn}
              >
                Log in
              </button>
            </form>
          </div>
          <p className="mt-4 text-sm text-center text-gray-700">
            Don&apos;t have an account?{' '}
            <Link href="/signup">
              <a className="text-blue-600 hover:text-blue-700">Sign up</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
