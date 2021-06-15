import Head from 'next/head';
import Link from 'next/link';
import AuthForm from 'components/AuthForm';

export default function Signup() {
  return (
    <>
      <Head>
        <title>Sign up | Notabase</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container p-8 md:p-24">
          <div className="mx-auto card md:p-12">
            <p className="pb-6 -mt-2 text-xl text-center">
              Sign up for Notabase
            </p>
            <AuthForm signup />
          </div>
          <p className="mt-4 text-sm text-center text-gray-700">
            Have an account?{' '}
            <Link href="/login">
              <a className="text-primary-600 hover:text-primary-700">Log in</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
