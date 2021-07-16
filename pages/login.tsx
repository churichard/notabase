import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AuthForm from 'components/AuthForm';
import PageLoading from 'components/PageLoading';
import { useAuth } from 'utils/useAuth';

export default function Login() {
  const { user, isLoaded } = useAuth();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.replace('/app');
    } else if (isLoaded) {
      setIsPageLoaded(true);
    }
  }, [router, user, isLoaded]);

  if (!isPageLoaded) {
    return <PageLoading />;
  }

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
