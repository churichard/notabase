import { Dispatch, SetStateAction, useCallback, memo } from 'react';
import { IconPlus, IconDownload } from '@tabler/icons';
import { useStore } from 'lib/store';
import useImport from 'utils/useImport';
import { Sort } from 'lib/createUserSettingsSlice';
import Tooltip from 'components/Tooltip';
import { isMobile } from 'utils/device';
import SidebarNotesSortDropdown from './SidebarNotesSortDropdown';

type Props = {
  noteSort: Sort;
  numOfNotes: number;
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

function SidebarNotesFooter(props: Props) {
  const { noteSort, numOfNotes, setIsFindOrCreateModalOpen } = props;
  const onImport = useImport();

  const setNoteSort = useStore((state) => state.setNoteSort);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const onCreateNoteClick = useCallback(() => {
    if (isMobile()) {
      setIsSidebarOpen(false);
    }
    setIsFindOrCreateModalOpen((isOpen) => !isOpen);
  }, [setIsSidebarOpen, setIsFindOrCreateModalOpen]);

  return (
    <div className="flex items-center justify-between border-t dark:border-gray-700">
      <Tooltip content="Create a new note">
        <button
          className="p-1 mx-2 my-1 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
          onClick={onCreateNoteClick}
        >
          <IconPlus size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </Tooltip>
      <span className="p-1 mx-2 my-1 text-xs text-gray-500 dark:text-gray-400">
        {numOfNotes} notes
      </span>
      <div className="mx-2 my-1">
        <SidebarNotesSortDropdown
          currentSort={noteSort}
          setCurrentSort={setNoteSort}
        />
        <Tooltip content="Import">
          <button
            className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
            onClick={onImport}
          >
            <IconDownload
              size={16}
              className="text-gray-600 dark:text-gray-300"
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default memo(SidebarNotesFooter);
