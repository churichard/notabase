import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import supabase from 'lib/supabase';

type Props = {
  signup?: boolean;
};

export default function AuthForm(props: Props) {
  const { signup = false } = props;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set auth cookie
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        });

        if (res.ok) {
          router.push('/app');
        } else {
          toast.error(`${res.status}: ${res.statusText}`);
          setIsLoading(false);
        }
      }
    );
    return () => authListener?.unsubscribe();
  }, [router]);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);

      let error;
      if (signup) {
        const result = await supabase.auth.signUp({
          email,
          password,
        });
        error = result.error;
      } else {
        const result = await supabase.auth.signIn({
          email,
          password,
        });
        error = result.error;
      }

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    },
    [signup, email, password]
  );

  return (
    <form onSubmit={onSubmit}>
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
        className={`w-full mt-6 btn ${isLoading && 'opacity-50 cursor-wait'}`}
        disabled={isLoading}
      >
        {signup ? 'Sign up' : 'Log in'}
      </button>
    </form>
  );
}
