import React, { ReactNode } from 'react';
import useNoteTitles from 'lib/api/useNoteTitles';
import { Note } from 'types/supabase';
import Sidebar from './Sidebar';

type Props = {
  children: ReactNode;
  initialNotes: Array<Note>;
  mainNoteId?: string;
  className?: string;
};

export default function AppLayout(props: Props) {
  const { children, initialNotes, mainNoteId, className } = props;
  const { data: notes } = useNoteTitles({ initialData: initialNotes });

  return (
    <div className={`flex h-screen ${className}`}>
      <Sidebar notes={notes} mainNoteId={mainNoteId} />
      {children}
    </div>
  );
}
