import { useState } from 'react';
import { IconX } from '@tabler/icons';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import OpenSidebarButton from 'components/sidebar/OpenSidebarButton';
import MoveToModal from 'components/MoveToModal';
import useOnClosePane from 'utils/useOnClosePane';
import NoteHeaderOptionsMenu from './NoteHeaderOptionsMenu';
import PublishMenu from './PublishMenu';

export default function NoteHeader() {
  const currentNote = useCurrentNote();

  const isSidebarButtonVisible = useStore(
    (state) => !state.isSidebarOpen && state.openNoteIds?.[0] === currentNote.id
  );
  const isCloseButtonVisible = useStore(
    (state) => state.openNoteIds.length > 1
  );

  const [isMoveToModalOpen, setIsMoveToModalOpen] = useState(false);

  const onClosePane = useOnClosePane();

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="flex w-full items-center justify-between px-4 py-1 text-right">
      <div>{isSidebarButtonVisible ? <OpenSidebarButton /> : null}</div>
      <div className="flex items-center">
        <PublishMenu />
        <NoteHeaderOptionsMenu setIsMoveToModalOpen={setIsMoveToModalOpen} />
        {isCloseButtonVisible ? (
          <Tooltip content="Close pane">
            <button
              className={buttonClassName}
              onClick={onClosePane}
              title="Close pane"
            >
              <span className="flex h-8 w-8 items-center justify-center">
                <IconX className={iconClassName} />
              </span>
            </button>
          </Tooltip>
        ) : null}
      </div>
      {isMoveToModalOpen ? (
        <Portal>
          <MoveToModal
            noteId={currentNote.id}
            setIsOpen={setIsMoveToModalOpen}
          />
        </Portal>
      ) : null}
    </div>
  );
}
