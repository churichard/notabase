import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="flex flex-col flex-none w-64 h-screen py-4 bg-gray-50 md:border-r md:border-gray-100 md:max-w-2xs">
      <Link href="/app">
        <a className="w-full px-8 py-1 text-lg font-medium text-gray-800 hover:bg-gray-200">
          Atomic
        </a>
      </Link>
      <Link href="/app">
        <a className="w-full px-8 py-1 mt-4 text-gray-800 hover:bg-gray-200">
          Test
        </a>
      </Link>
    </div>
  );
};

export default Sidebar;
