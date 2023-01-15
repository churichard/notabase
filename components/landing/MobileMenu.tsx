import { useRef } from 'react';
import Link from 'next/link';
import { IconX } from '@tabler/icons';
import classNames from 'classnames';
import LogoWithText from 'components/LogoWithText';
import useOnClickOutside from 'utils/useOnClickOutside';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function MobileMenu(props: Props) {
  const { isOpen, setIsOpen } = props;
  const mobileMenuRef = useRef(null);
  useOnClickOutside(mobileMenuRef.current, () => {
    if (isOpen) setIsOpen(false);
  });

  const mobileMenuClassNames = classNames(
    'absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden',
    { hidden: !isOpen }
  );

  return (
    <div ref={mobileMenuRef} className={mobileMenuClassNames}>
      <div className="rounded-lg bg-white shadow-lg">
        <div className="space-y-6 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <LogoWithText />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-700 focus:bg-gray-100 focus:text-gray-700 focus:outline-none"
            >
              <IconX />
            </button>
          </div>
        </div>
        <div className="space-y-4 px-6 pt-0 pb-6">
          <span className="flex w-full rounded-md shadow-sm">
            <Link href="/signup">
              <a className="btn block w-full px-4 py-2 text-center">
                Get started
              </a>
            </Link>
          </span>
          <p className="text-center text-base font-medium leading-6 text-gray-700">
            Already have an account?{' '}
            <Link href="/login">
              <a className="text-primary-600 transition duration-150 ease-in-out hover:text-primary-500">
                Sign in
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
