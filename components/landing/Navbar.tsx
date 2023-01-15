import { useState } from 'react';
import Link from 'next/link';
import { IconMenu2 } from '@tabler/icons';
import LogoWithText from 'components/LogoWithText';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="container px-6 pt-6">
      <div className="flex items-center justify-between space-x-6 text-gray-900">
        <LogoWithText />
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 transition duration-150 ease-in-out hover:bg-gray-100 md:hidden"
        >
          <IconMenu2 className="text-gray-700" />
        </button>
        <div className="hidden items-center space-x-2 md:flex">
          <Link href="/login">
            <a className="rounded px-4 py-2 font-medium transition duration-200 ease-in-out hover:text-gray-600">
              Sign in
            </a>
          </Link>
          <Link href="/signup">
            <a className="btn px-4 py-2">Get started</a>
          </Link>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </div>
  );
}
