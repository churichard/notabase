import { Dispatch, SetStateAction, useState } from 'react';
import { IconFile, IconSearch, TablerIcon } from '@tabler/icons';
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
        <Tab
          isActive={activeTab === SidebarTab.Notes}
          setActive={() => setActiveTab(SidebarTab.Notes)}
          Icon={IconFile}
        />
      </Tooltip>
      <Tooltip content="Search">
        <Tab
          isActive={activeTab === SidebarTab.Search}
          setActive={() => setActiveTab(SidebarTab.Search)}
          Icon={IconSearch}
        />
      </Tooltip>
    </div>
  );
};

type TabProps = {
  isActive: boolean;
  setActive: () => void;
  Icon: TablerIcon;
};

const Tab = (props: TabProps) => {
  const { isActive, setActive, Icon } = props;
  return (
    <button
      className={`flex justify-center flex-1 py-1.5 px-6 rounded-t hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:border-gray-700 ${
        isActive ? 'bg-gray-50 border-t border-r dark:bg-gray-800' : 'border-b'
      }`}
      onClick={setActive}
    >
      <Icon
        size={20}
        className={
          isActive ? 'text-gray-800 dark:text-gray-300' : 'text-gray-500'
        }
      />
    </button>
  );
};
