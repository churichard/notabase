import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import useNoteTitles from 'lib/api/useNoteTitles';
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
  const [isFindOrCreateModalOpen, setIsFindOrCreateModalOpen] = useState(false);

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
