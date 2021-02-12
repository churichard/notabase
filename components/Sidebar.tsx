import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="flex flex-col flex-none w-64 h-screen py-4 bg-blue-50 md:border-r md:border-blue-100 md:max-w-2xs">
      <div className="px-4 text-gray-800 sm:px-8">
        <Link href="/app">
          <a className="text-lg font-medium">Atomic</a>
        </Link>
      </div>
      <div className="pt-4">
        <Link href="/app">
          <a className="px-4 text-gray-800 sm:px-8">Test</a>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
