import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Notes } from 'lib/store';
import { useStore, store } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import useHotkeys from 'utils/useHotkeys';
import Sidebar from './Sidebar';
import FindOrCreateModal from './FindOrCreateModal';

const SM_BREAKPOINT = 640;

type Props = {
  children: ReactNode;
  initialNotes: Notes;
  className?: string;
};

export default function AppLayout(props: Props) {
  const { children, initialNotes, className } = props;
  const { user } = useAuth();
  const [isFindOrCreateModalOpen, setIsFindOrCreateModalOpen] = useState(false);

  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const setNotes = useStore((state) => state.setNotes);
  const upsertNote = useStore((state) => state.upsertNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);

  useEffect(() => {
    setNotes(initialNotes);

    if (window.innerWidth <= SM_BREAKPOINT) {
      setIsSidebarOpen(false);
    }
  }, [initialNotes, setNotes, setIsSidebarOpen]);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Subscribe to changes on the notes table for the logged in user
    const subscription = supabase
      .from<Note>(`notes:user_id=eq.${user.id}`)
      .on('*', (payload) => {
        if (payload.eventType === 'INSERT') {
          upsertNote(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          // Don't update the note if it is currently open
          const openNoteIds = store.getState().openNoteIds;
          if (!openNoteIds.includes(payload.new.id)) {
            updateNote(payload.new);
          }
        } else if (payload.eventType === 'DELETE') {
          deleteNote(payload.old.id);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, upsertNote, updateNote, deleteNote]);

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'mod+p',
        callback: () => setIsFindOrCreateModalOpen((isOpen) => !isOpen),
      },
    ],
    [setIsFindOrCreateModalOpen]
  );
  useHotkeys(hotkeys);

  return (
    <div className={`flex h-screen ${className}`}>
      {isSidebarOpen ? (
        <Sidebar setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen} />
      ) : null}
      {children}
      {isFindOrCreateModalOpen ? (
        <FindOrCreateModal setIsOpen={setIsFindOrCreateModalOpen} />
      ) : null}
    </div>
  );
}
