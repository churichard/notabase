import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Note } from 'types/supabase';
import addNote from 'lib/api/addNote';
import { useAuth } from 'utils/useAuth';

type Props = {
  notes?: Array<Note>;
  currentNoteId?: string;
};

export default function Sidebar(props: Props) {
  const { notes, currentNoteId } = props;
  const { user } = useAuth();
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const onInputSubmit = async () => {
    if (!user) {
      return;
    }
    const note = await addNote(user.id, inputText);
    if (!note) {
      return;
    }
    setInputText('');
    router.push(`/app/note/${note.id}`);
  };

  return (
    <div className="flex flex-col flex-none w-64 h-full border-r border-gray-100 bg-gray-50">
      <Link href="/app">
        <a className="w-full px-6 py-3 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div className="font-medium">Notabase</div>
          <div className="text-sm">{user?.email}</div>
        </a>
      </Link>
      <input
        type="text"
        className="mx-6 my-2 input"
        placeholder="Create note"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            onInputSubmit();
          }
        }}
      />
      <div className="flex flex-col mt-2">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <NoteLink key={note.id} note={note} currentNoteId={currentNoteId} />
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
  currentNoteId?: string;
};

function NoteLink(props: NoteLinkProps) {
  const { note, currentNoteId } = props;
  return (
    <Link href={`/app/note/${note.id}`}>
      <a
        className={`w-full px-6 py-1 text-gray-800 hover:bg-gray-200 active:bg-gray-300 ${
          currentNoteId === note.id ? 'bg-gray-200' : 'bg-gray-50'
        }`}
      >
        {note.title}
      </a>
    </Link>
  );
}
