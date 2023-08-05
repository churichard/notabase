import Head from 'next/head';
import Link from 'next/link';
import AuthForm from 'components/AuthForm';
import LogoWithText from 'components/LogoWithText';
import LandingLayout from 'components/landing/LandingLayout';

export default function Signup() {
  return (
    <LandingLayout showNavbar={false} showFooter={false}>
      <Head>
        <title>Sign Up | VS. NOTES</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container p-8 md:p-24">
          <div className="mb-6 flex items-center justify-center">
            <LogoWithText />
          </div>
          <div className="card mx-auto md:p-12">
            <p className="-mt-2 pb-6 text-center text-xl">
              Create your VS. NOTES account
            </p>
            <AuthForm signup />
          </div>
          <p className="mt-4 text-center text-sm text-gray-700">
            Have an account?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
