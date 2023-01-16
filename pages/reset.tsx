import { FormEvent, useCallback, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify';
import LogoWithText from 'components/LogoWithText';
import LandingLayout from 'components/landing/LandingLayout';
import supabase from 'lib/supabase';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.BASE_URL}/resetting-password`,
      });

      if (error) {
        toast.error(error.message);
      } else if (data) {
        setShowConfirmationMessage(true);
      }

      setIsLoading(false);
    },
    [email]
  );

  return (
    <LandingLayout showNavbar={false} showFooter={false}>
      <Head>
        <title>Reset your password | Notabase</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container p-8 md:p-24">
          <div className="mb-6 flex items-center justify-center">
            <LogoWithText />
          </div>
          <div className="card mx-auto md:p-12">
            <p className="-mt-2 pb-4 text-center text-xl">
              Reset your password
            </p>
            <p className="pb-6 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
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
                  className="input mt-2 w-full py-2"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <button
                className={`btn mt-6 w-full ${
                  isLoading && 'cursor-wait opacity-50'
                }`}
                disabled={isLoading}
              >
                Continue
              </button>
              {showConfirmationMessage ? (
                <div className="mt-4 text-primary-500">
                  We just sent you a password reset email. Please check your
                  inbox and click the link to reset your password.
                </div>
              ) : null}
            </form>
          </div>
          <p className="mt-4 text-center text-sm text-gray-700">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700"
            >
              Return to sign in
            </Link>
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
