import type { ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import { useStore } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import Sidebar from './Sidebar';
import FindOrCreateModal from './FindOrCreateModal';

type Props = {
  children: ReactNode;
  initialNotes: Array<Note>;
  className?: string;
};

export default function AppLayout(props: Props) {
  const { children, initialNotes, className } = props;
  const { user } = useAuth();
  const [isFindOrCreateModalOpen, setIsFindOrCreateModalOpen] = useState(false);

  const notes = useStore((state) => state.notes);
  const setNotes = useStore((state) => state.setNotes);
  const upsertNote = useStore((state) => state.upsertNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, setNotes]);

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
          updateNote(payload.new);
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

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      for (const { hotkey, callback } of hotkeys) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault();
          callback();
        }
      }
    };
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () =>
      document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [hotkeys]);

  return (
    <div className={`flex h-screen ${className}`}>
      <Sidebar
        notes={notes}
        setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
      />
      {children}
      <FindOrCreateModal
        isOpen={isFindOrCreateModalOpen}
        setIsOpen={setIsFindOrCreateModalOpen}
      />
    </div>
  );
}
