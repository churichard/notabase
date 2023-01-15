import { FormEvent, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify';
import LogoWithText from 'components/LogoWithText';
import LandingLayout from 'components/landing/LandingLayout';
import supabase from 'lib/supabase';

export default function ResettingPassword() {
  const [hash, setHash] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  useEffect(() => {
    setHash(window.location.hash);
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!hash) {
        toast.error('Invalid access token or type');
        return;
      }

      // Format is #access_token=x&refresh_token=y&expires_in=z&token_type=bearer&type=recovery
      const hashArr = hash
        .substring(1)
        .split('&')
        .map((param) => param.split('='));

      let type;
      let accessToken;
      for (const [key, value] of hashArr) {
        if (key === 'type') {
          type = value;
        } else if (key === 'access_token') {
          accessToken = value;
        }
      }

      if (
        type !== 'recovery' ||
        !accessToken ||
        typeof accessToken === 'object'
      ) {
        toast.error('Invalid access token or type');
        return;
      }

      setIsLoading(true);

      const { error } = await supabase.auth.api.updateUser(accessToken, {
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setShowConfirmationMessage(true);
      }

      setIsLoading(false);
    },
    [newPassword, hash]
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
            <p className="-mt-2 pb-6 text-center text-xl">
              Reset your password
            </p>
            <form onSubmit={onSubmit}>
              <div>
                <label htmlFor="password" className="block text-gray-700">
                  New password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="input mt-2 w-full py-2"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
              <button
                className={`btn mt-6 w-full ${
                  isLoading && 'cursor-wait opacity-50'
                }`}
                disabled={isLoading}
              >
                Set new password
              </button>
              {showConfirmationMessage ? (
                <div className="mt-4 text-primary-500">
                  Your new password has been successfully set! You can now log
                  into your account.
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
