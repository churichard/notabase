import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useStore, store } from 'lib/store';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import useHotkeys from 'utils/useHotkeys';
import Sidebar from './sidebar/Sidebar';
import FindOrCreateModal from './FindOrCreateModal';
import PageLoading from './PageLoading';
import SettingsModal from './SettingsModal';
import UpgradeModal from './UpgradeModal';

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

    // Redirect to most recent note or first note in database
    if (router.pathname === '/app') {
      const openNoteIds = store.getState().openNoteIds;
      if (
        openNoteIds.length > 0 &&
        notes &&
        notes.findIndex((note) => note.id === openNoteIds[0]) > -1
      ) {
        router.replace(`/app/note/${openNoteIds[0]}`);
        return;
      } else if (notes && notes.length > 0) {
        router.replace(`/app/note/${notes[0].id}`);
        return;
      }
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const setIsPageStackingOn = useStore((state) => state.setIsPageStackingOn);
  const isUpgradeModalOpen = useStore((state) => state.isUpgradeModalOpen);
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

  useEffect(() => {
    const {
      query: { checkout_session_id: checkoutSessionId, ...otherQueryParams },
    } = router;

    if (checkoutSessionId) {
      // Show toast if the user successfully subscribed to Notabase
      toast.success('You have successfully subscribed to Notabase! 🎉');
      router.push(
        { pathname: router.pathname, query: otherQueryParams },
        undefined,
        { shallow: true }
      );
    }
  }, [router]);

  if (!isPageLoaded) {
    return <PageLoading />;
  }

  return (
    <div className={`flex h-screen ${className}`}>
      <Sidebar
        className={!isSidebarOpen ? 'hidden' : undefined}
        setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      {children}
      {isSettingsOpen ? <SettingsModal setIsOpen={setIsSettingsOpen} /> : null}
      {isFindOrCreateModalOpen ? (
        <FindOrCreateModal setIsOpen={setIsFindOrCreateModalOpen} />
      ) : null}
      {isUpgradeModalOpen ? <UpgradeModal /> : null}
    </div>
  );
}
