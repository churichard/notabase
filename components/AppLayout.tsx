import React, { ReactNode, useEffect, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import useNoteTitles from 'lib/api/useNoteTitles';
import { useStore } from 'lib/state';
import { Note } from 'types/supabase';
import Sidebar from './Sidebar';
import FindOrCreateModal from './FindOrCreateModal';

type Props = {
  children: ReactNode;
  initialNotes: Array<Note>;
  className?: string;
};

export default function AppLayout(props: Props) {
  const { children, initialNotes, className } = props;
  const { data: notes } = useNoteTitles({ initialData: initialNotes });
  const isFindOrCreateModalOpen = useStore(
    (state) => state.isFindOrCreateModalOpen
  );
  const setIsFindOrCreateModalOpen = useStore(
    (state) => state.setIsFindOrCreateModalOpen
  );

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'mod+p',
        callback: () => setIsFindOrCreateModalOpen(!isFindOrCreateModalOpen),
      },
    ],
    [isFindOrCreateModalOpen, setIsFindOrCreateModalOpen]
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
      <Sidebar notes={notes} />
      {children}
      <FindOrCreateModal
        isOpen={isFindOrCreateModalOpen}
        setIsOpen={setIsFindOrCreateModalOpen}
      />
    </div>
  );
}
