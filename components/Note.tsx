import React from 'react';
import dynamic from 'next/dynamic';
import Title from 'components/editor/Title';
import { Note as NoteType } from 'types/supabase';

// Workaround for Slate bug when hot reloading: https://github.com/ianstormtaylor/slate/issues/3621
const Editor = dynamic(() => import('components/editor/Editor'), {
  ssr: false,
});

type Props = {
  note: NoteType;
};

export default function Note(props: Props) {
  const { note } = props;
  return (
    <div className="flex flex-col p-12 overflow-y-auto w-176">
      <Title className="mb-6" initialValue={note.title} />
      <Editor className="flex-1" initialValue={JSON.parse(note.content)} />
    </div>
  );
}
