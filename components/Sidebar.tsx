import React from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Note } from 'types/supabase';

type Props = {
  user: User;
  notes: Note[];
};

const Sidebar = (props: Props) => {
  const { user, notes } = props;
  return (
    <div className="flex flex-col flex-none w-64 h-full border-r border-gray-100 bg-gray-50">
      <Link href="/app">
        <a className="w-full px-8 py-3 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div className="font-medium">Atomic</div>
          <div className="text-sm">{user.email}</div>
        </a>
      </Link>
      {notes.map((note) => (
        <Link key={note.id} href={`/note/${note.id}`}>
          <a className="w-full px-8 py-1 mt-2 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
            {note.title}
          </a>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
