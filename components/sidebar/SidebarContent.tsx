import { Dispatch, SetStateAction, useState } from 'react';
import { IconFile, IconSearch } from '@tabler/icons';
import Tooltip from 'components/Tooltip';
import SidebarNotes from './SidebarNotes';
import SidebarSearch from './SidebarSearch';
import SidebarTab from './SidebarTab';

enum SidebarTabType {
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
  const [activeTab, setActiveTab] = useState<SidebarTabType>(
    SidebarTabType.Notes
  );

  return (
    <div className={`flex flex-col ${className}`}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <SidebarNotes
          className={activeTab !== SidebarTabType.Notes ? 'hidden' : undefined}
          currentNoteId={currentNoteId}
          setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
        />
        <SidebarSearch
          className={activeTab !== SidebarTabType.Search ? 'hidden' : undefined}
        />
      </div>
    </div>
  );
}

type TabsProps = {
  activeTab: SidebarTabType;
  setActiveTab: (tab: SidebarTabType) => void;
};

const Tabs = (props: TabsProps) => {
  const { activeTab, setActiveTab } = props;

  return (
    <div className="flex">
      <Tooltip content="Notes List">
        <SidebarTab
          isActive={activeTab === SidebarTabType.Notes}
          setActive={() => setActiveTab(SidebarTabType.Notes)}
          Icon={IconFile}
          className={activeTab === SidebarTabType.Notes ? 'border-r' : ''}
        />
      </Tooltip>
      <Tooltip content="Search">
        <SidebarTab
          isActive={activeTab === SidebarTabType.Search}
          setActive={() => setActiveTab(SidebarTabType.Search)}
          Icon={IconSearch}
          className={activeTab === SidebarTabType.Search ? 'border-l' : ''}
        />
      </Tooltip>
    </div>
  );
};
