import { FormEvent, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import LogoWithText from 'components/LogoWithText';
import LandingLayout from 'components/landing/LandingLayout';
import supabase from 'lib/supabase';
import PageLoading from 'components/PageLoading';

export default function ResettingPassword() {
  const router = useRouter();
  const type = router.query.type as string;
  const accessToken = router.query.access_token as string;

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);

      const { error, data } = await supabase.auth.api.updateUser(accessToken, {
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else if (data) {
        setShowConfirmationMessage(true);
      }

      setIsLoading(false);
    },
    [newPassword, accessToken]
  );

  useEffect(() => {
    if (type !== 'recovery' || !accessToken) {
      router.push('/reset');
    } else {
      setIsPageLoading(false);
    }
  }, [router, type, accessToken]);

  if (isPageLoading) {
    return <PageLoading />;
  }

  return (
    <LandingLayout showNavbar={false} showFooter={false}>
      <Head>
        <title>Reset your password | Notabase</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container p-8 md:p-24">
          <div className="flex items-center justify-center mb-6">
            <LogoWithText />
          </div>
          <div className="mx-auto card md:p-12">
            <p className="pb-6 -mt-2 text-xl text-center">
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
                  className="w-full py-2 mt-2 input"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
              <button
                className={`w-full mt-6 btn ${
                  isLoading && 'opacity-50 cursor-wait'
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
          <p className="mt-4 text-sm text-center text-gray-700">
            <Link href="/login">
              <a className="text-primary-600 hover:text-primary-700">
                Return to sign in
              </a>
            </Link>
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
