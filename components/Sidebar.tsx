import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import { mutate } from 'swr';
import { Note } from 'types/supabase';
import supabase from 'lib/supabase';
import { DEFAULT_NOTE_CONTENT } from 'editor/constants';
import { NOTE_TITLES_KEY } from 'api/useNoteTitles';

type Props = {
  user: User;
  notes?: Array<Note>;
  currentNoteId?: string;
};

export default function Sidebar(props: Props) {
  const { user, notes, currentNoteId } = props;
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const onInputSubmit = async () => {
    const { data } = await supabase
      .from<Note>('notes')
      .insert([
        {
          user_id: user.id,
          title: inputText,
          content: JSON.stringify(DEFAULT_NOTE_CONTENT),
        },
      ])
      .single();

    if (!data) {
      return;
    }

    setInputText('');
    router.push(`/app/note/${data.id}`);
    mutate(NOTE_TITLES_KEY); // Adds the new note to the sidebar
  };

  return (
    <div className="flex flex-col flex-none w-64 h-full border-r border-gray-100 bg-gray-50">
      <Link href="/app">
        <a className="w-full px-6 py-3 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div className="font-medium">Notabase</div>
          <div className="text-sm">{user.email}</div>
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
        {notes
          ? notes.map((note) => (
              <NoteLink
                key={note.id}
                note={note}
                currentNoteId={currentNoteId}
              />
            ))
          : null}
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
