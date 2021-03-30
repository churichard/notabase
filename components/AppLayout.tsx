import React, { ReactNode, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import useNoteTitles from 'lib/api/useNoteTitles';
import { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import Sidebar from './Sidebar';

type Props = {
  children: ReactNode;
  initialUser: User;
  initialNotes: Array<Note>;
  currentNote?: Note;
};

export default function AppLayout(props: Props) {
  const { children, initialUser, initialNotes, currentNote } = props;
  const { data: notes } = useNoteTitles({ initialData: initialNotes });
  const { setUser } = useAuth();

  useEffect(() => {
    /**
     * Set the user in the context, so that we are able to access it throughout the app.
     * The user passed into AppLayout should be the user returned from getServerSideProps.
     */
    setUser(initialUser);
  }, [initialUser, setUser]);

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} currentNoteId={currentNote?.id} />
      {children}
    </div>
  );
}
