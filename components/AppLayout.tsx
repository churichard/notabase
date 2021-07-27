import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useStore, store } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import useHotkeys from 'utils/useHotkeys';
import Sidebar from './sidebar/Sidebar';
import FindOrCreateModal from './FindOrCreateModal';
import PageLoading from './PageLoading';

const SM_BREAKPOINT = 640;

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AppLayout(props: Props) {
  const { children, className } = props;
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const setNotes = useStore((state) => state.setNotes);
  const initData = useCallback(async () => {
    if (!user) {
      return;
    }

    const { data: notes } = await supabase
      .from<Note>('notes')
      .select('id, title, content')
      .eq('user_id', user.id)
      .order('title');

    // Redirect to most recent note
    const openNoteIds = store.getState().openNoteIds;
    if (router.pathname === '/app' && openNoteIds.length > 0) {
      router.replace(`/app/note/${openNoteIds[0]}`);
      return;
    }

    if (!notes) {
      setIsPageLoaded(true);
      return;
    }

    const notesAsObj = notes.reduce<Record<Note['id'], Note>>((acc, note) => {
      acc[note.id] = note;
      return acc;
    }, {});

    setNotes(notesAsObj);
    setIsPageLoaded(true);
  }, [user, router, setNotes]);

  useEffect(() => {
    if (isLoaded && !user) {
      // Redirect to login page if there is no user logged in
      router.replace('/login');
    } else if (!isPageLoaded && isLoaded && user) {
      // Initialize data if there is a user and the data has not been initialized yet
      initData();
    }
  }, [router, user, isLoaded, isPageLoaded, initData]);

  const [isFindOrCreateModalOpen, setIsFindOrCreateModalOpen] = useState(false);

  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const setIsPageStackingOn = useStore((state) => state.setIsPageStackingOn);
  const upsertNote = useStore((state) => state.upsertNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);

  useEffect(() => {
    if (window.innerWidth <= SM_BREAKPOINT) {
      setIsSidebarOpen(false);
      setIsPageStackingOn(false);
    }
  }, [setIsSidebarOpen, setIsPageStackingOn]);

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

  if (!isPageLoaded) {
    return <PageLoading />;
  }

  return (
    <div className={`flex h-screen ${className}`}>
      <Sidebar
        className={!isSidebarOpen ? 'hidden' : undefined}
        setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
      />
      {children}
      {isFindOrCreateModalOpen ? (
        <FindOrCreateModal setIsOpen={setIsFindOrCreateModalOpen} />
      ) : null}
    </div>
  );
}
