import { useState } from 'react';
import { IconFile, IconSearch } from '@tabler/icons';
import SidebarNotes from './SidebarNotes';
import SidebarSearch from './SidebarSearch';

enum SidebarTab {
  Notes,
  Search,
}

type Props = {
  currentNoteId?: string;
  className?: string;
};

export default function SidebarContent(props: Props) {
  const { currentNoteId, className } = props;
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.Notes);

  return (
    <div className={`flex flex-col ${className}`}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
        <SidebarNotes
          className={activeTab !== SidebarTab.Notes ? 'hidden' : undefined}
          currentNoteId={currentNoteId}
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
      <button
        className={`flex justify-center flex-1 py-1.5 rounded-t hover:bg-gray-100 active:bg-gray-200 ${
          activeTab === SidebarTab.Notes
            ? 'bg-gray-50 border-t border-r'
            : 'border-b'
        }`}
        onClick={() => setActiveTab(SidebarTab.Notes)}
      >
        <IconFile
          size={20}
          className={
            activeTab === SidebarTab.Notes ? 'text-gray-800' : 'text-gray-500'
          }
        />
      </button>
      <button
        className={`flex justify-center flex-1 py-1.5 rounded-t hover:bg-gray-100 active:bg-gray-200 ${
          activeTab === SidebarTab.Search
            ? 'bg-gray-50 border-t border-l'
            : 'border-b'
        }`}
        onClick={() => setActiveTab(SidebarTab.Search)}
      >
        <IconSearch
          size={20}
          className={
            activeTab === SidebarTab.Search ? 'text-gray-800' : 'text-gray-500'
          }
        />
      </button>
    </div>
  );
};
