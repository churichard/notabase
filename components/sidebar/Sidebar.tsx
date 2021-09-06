import { memo, useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconAffiliate, IconSearch } from '@tabler/icons';
import Tooltip from 'components/Tooltip';
import { isMobile } from 'utils/device';
import { useStore } from 'lib/store';
import SidebarItem from './SidebarItem';
import SidebarContent from './SidebarContent';
import SidebarHeader from './SidebarHeader';

type Props = {
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

function Sidebar(props: Props) {
  const { setIsFindOrCreateModalOpen, setIsSettingsOpen, className } = props;
  const router = useRouter();
  const currentNoteId = useMemo(() => {
    const id = router.query.id;
    return id && typeof id === 'string' ? id : undefined;
  }, [router]);

  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const onSidebarItemClick = useCallback(() => {
    if (isMobile()) {
      setIsSidebarOpen(false);
    }
  }, [setIsSidebarOpen]);

  return (
    <div
      className={`flex flex-col flex-none h-full border-r bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 ${className}`}
    >
      <SidebarHeader setIsSettingsOpen={setIsSettingsOpen} />
      <SidebarItem onClick={onSidebarItemClick}>
        <Tooltip
          content="Quickly jump to a note, or create a new note (Ctrl+P)"
          placement="right"
          touch={false}
        >
          <button
            className="flex items-center w-full px-6 py-1 text-left"
            onClick={() => setIsFindOrCreateModalOpen((isOpen) => !isOpen)}
          >
            <IconSearch
              className="flex-shrink-0 mr-1 text-gray-800 dark:text-gray-300"
              size={20}
            />
            <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
              Find or Create Note
            </span>
          </button>
        </Tooltip>
      </SidebarItem>
      <SidebarItem
        isHighlighted={router.pathname.includes('/app/graph')}
        onClick={onSidebarItemClick}
      >
        <Tooltip
          content="Visualization of all of your notes as a network"
          placement="right"
          touch={false}
        >
          <span>
            <Link href="/app/graph">
              <a className="flex items-center px-6 py-1">
                <IconAffiliate
                  className="flex-shrink-0 mr-1 text-gray-800 dark:text-gray-300 "
                  size={20}
                />
                <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
                  Graph View
                </span>
              </a>
            </Link>
          </span>
        </Tooltip>
      </SidebarItem>
      <SidebarContent
        className="flex-1 mt-3 overflow-x-hidden overflow-y-auto"
        currentNoteId={currentNoteId}
        setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
      />
    </div>
  );
}

export default memo(Sidebar);
