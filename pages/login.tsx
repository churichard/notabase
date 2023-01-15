import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AuthForm from 'components/AuthForm';
import PageLoading from 'components/PageLoading';
import { useAuth } from 'utils/useAuth';
import LogoWithText from 'components/LogoWithText';
import LandingLayout from 'components/landing/LandingLayout';

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
    <LandingLayout showNavbar={false} showFooter={false}>
      <Head>
        <title>Sign In | Notabase</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container p-8 md:p-24">
          <div className="mb-6 flex items-center justify-center">
            <LogoWithText />
          </div>
          <div className="card mx-auto md:p-12">
            <p className="-mt-2 pb-6 text-center text-xl">
              Sign in to Notabase
            </p>
            <AuthForm />
          </div>
          <p className="mt-4 text-center text-sm text-gray-700">
            Don&apos;t have an account?{' '}
            <Link href="/signup">
              <a className="text-primary-600 hover:text-primary-700">Sign up</a>
            </Link>
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
