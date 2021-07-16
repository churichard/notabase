import Link from 'next/link';
import Logo from 'components/Logo';

export default function Navbar() {
  return (
    <div className="container flex items-center justify-between px-6 py-6 space-x-6 text-gray-900">
      <Link href="/">
        <a className="flex items-center">
          <Logo width={28} height={28} />
          <span className="ml-2 text-xl font-semibold">Notabase</span>
        </a>
      </Link>
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <a className="px-4 py-2 transition duration-200 ease-in-out rounded hover:bg-gray-200">
            Sign in
          </a>
        </Link>
        <Link href="/signup">
          <a className="px-4 py-2 font-semibold btn">Get started</a>
        </Link>
      </div>
    </div>
  );
}
