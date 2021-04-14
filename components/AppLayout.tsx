import React, { ReactNode } from 'react';
import useNoteTitles from 'lib/api/useNoteTitles';
import { Note } from 'types/supabase';
import Sidebar from './Sidebar';

type Props = {
  children: ReactNode;
  initialNotes: Array<Note>;
  currentNoteId?: string;
};

export default function AppLayout(props: Props) {
  const { children, initialNotes, currentNoteId } = props;
  const { data: notes } = useNoteTitles({ initialData: initialNotes });

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} currentNoteId={currentNoteId} />
      {children}
    </div>
  );
}
