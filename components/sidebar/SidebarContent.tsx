import { Dispatch, SetStateAction, useState } from 'react';
import { IconFile, IconSearch } from '@tabler/icons';
import Tooltip from 'components/Tooltip';
import SidebarNotes from './SidebarNotes';
import SidebarSearch from './SidebarSearch';

enum SidebarTab {
  Notes,
  Search,
}

type Props = {
  currentNoteId?: string;
  className?: string;
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function SidebarContent(props: Props) {
  const { currentNoteId, className, setIsFindOrCreateModalOpen } = props;
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.Notes);

  return (
    <div className={`flex flex-col ${className}`}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <SidebarNotes
          className={activeTab !== SidebarTab.Notes ? 'hidden' : undefined}
          currentNoteId={currentNoteId}
          setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
        />
        <SidebarSearch
          className={activeTab !== SidebarTab.Search ? 'hidden' : undefined}
        />
      </div>
    </div>
  );
}

type TabsProps = {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
};

const Tabs = (props: TabsProps) => {
  const { activeTab, setActiveTab } = props;

  return (
    <div className="flex">
      <Tooltip content="Notes List">
        <button
          className={`flex justify-center flex-1 py-1.5 px-6 rounded-t hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:border-gray-700 ${
            activeTab === SidebarTab.Notes
              ? 'bg-gray-50 border-t border-r dark:bg-gray-800'
              : 'border-b'
          }`}
          onClick={() => setActiveTab(SidebarTab.Notes)}
        >
          <IconFile
            size={20}
            className={
              activeTab === SidebarTab.Notes
                ? 'text-gray-800 dark:text-gray-300'
                : 'text-gray-500'
            }
          />
        </button>
      </Tooltip>
      <Tooltip content="Search">
        <button
          className={`flex justify-center flex-1 py-1.5 px-6 rounded-t hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:border-gray-700 ${
            activeTab === SidebarTab.Search
              ? 'bg-gray-50 border-t border-l dark:bg-gray-800'
              : 'border-b'
          }`}
          onClick={() => setActiveTab(SidebarTab.Search)}
        >
          <IconSearch
            size={20}
            className={
              activeTab === SidebarTab.Search
                ? 'text-gray-800 dark:text-gray-300'
                : 'text-gray-500'
            }
          />
        </button>
      </Tooltip>
    </div>
  );
};
