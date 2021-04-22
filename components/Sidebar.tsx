import React from 'react';
import Link from 'next/link';
import { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import SidebarInput from './SidebarInput';

type Props = {
  notes?: Array<Note>;
  mainNoteId?: string;
};

export default function Sidebar(props: Props) {
  const { notes, mainNoteId } = props;
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-none w-64 h-full border-r border-gray-100 bg-gray-50">
      <Link href="/app">
        <a className="w-full px-6 py-3 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div className="font-medium">Notabase</div>
          <div className="text-sm">{user?.email}</div>
        </a>
      </Link>
      <SidebarInput />
      <div className="flex flex-col mt-2 overflow-y-auto">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <NoteLink key={note.id} note={note} mainNoteId={mainNoteId} />
          ))
        ) : (
          <p className="px-6 text-gray-500">No notes yet</p>
        )}
      </div>
    </div>
  );
}

type NoteLinkProps = {
  note: Note;
  mainNoteId?: string;
};

function NoteLink(props: NoteLinkProps) {
  const { note, mainNoteId } = props;
  return (
    <Link href={`/app/note/${note.id}`}>
      <a
        className={`w-full px-6 py-1 text-gray-800 hover:bg-gray-200 active:bg-gray-300 ${
          mainNoteId === note.id ? 'bg-gray-200' : 'bg-gray-50'
        }`}
      >
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap">
          {note.title}
        </p>
      </a>
    </Link>
  );
}
