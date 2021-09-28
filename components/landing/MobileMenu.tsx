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
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 pt-6 pb-4 space-y-6">
          <div className="flex items-center justify-between">
            <LogoWithText />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center p-2 text-gray-400 transition duration-150 ease-in-out rounded-md hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-700"
            >
              <IconX />
            </button>
          </div>
        </div>
        <div className="px-6 pt-0 pb-6 space-y-4">
          <span className="flex w-full rounded-md shadow-sm">
            <Link href="/signup">
              <a className="block w-full px-4 py-2 text-center btn">
                Get started
              </a>
            </Link>
          </span>
          <p className="text-base font-medium leading-6 text-center text-gray-700">
            Already have an account?{' '}
            <Link href="/login">
              <a className="transition duration-150 ease-in-out text-primary-600 hover:text-primary-500">
                Sign in
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
