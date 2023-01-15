import { useMemo, useState } from 'react';
import { IconBrightnessHalf, IconCreditCard, IconPencil } from '@tabler/icons';
import useHotkeys from 'utils/useHotkeys';
import SidebarItem from '../sidebar/SidebarItem';
import Billing from './Billing';
import Appearance from './Appearance';
import EditorSettings from './EditorSettings';

enum SettingsTab {
  Appearance = 'appearance',
  Editor = 'editor',
  Billing = 'billing',
}

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export default function SettingsModal(props: Props) {
  const { setIsOpen } = props;
  const [currentTab, setCurrentTab] = useState<SettingsTab>(
    SettingsTab.Appearance
  );

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'esc',
        callback: () => setIsOpen(false),
      },
    ],
    [setIsOpen]
  );
  useHotkeys(hotkeys);

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={() => setIsOpen(false)}
      />
      <div className="flex h-screen items-center justify-center p-6">
        <div className="z-30 flex h-full w-full max-w-full flex-col overflow-hidden rounded bg-white shadow-popover sm:max-h-176 sm:w-240 sm:flex-row">
          <SettingsModalSidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
          {currentTab === SettingsTab.Appearance ? <Appearance /> : null}
          {currentTab === SettingsTab.Editor ? <EditorSettings /> : null}
          {currentTab === SettingsTab.Billing ? <Billing /> : null}
        </div>
      </div>
    </div>
  );
}

type SettingsModalSidebarProps = {
  currentTab: SettingsTab;
  setCurrentTab: (tab: SettingsTab) => void;
};

const SettingsModalSidebar = (props: SettingsModalSidebarProps) => {
  const { currentTab, setCurrentTab } = props;
  return (
    <div className="flex w-full flex-none flex-col border-b bg-gray-50 py-4 dark:border-gray-700 dark:bg-gray-800 sm:h-full sm:w-48 sm:border-b-0 sm:border-r">
      <div className="px-4 pb-2 text-sm text-gray-600 dark:text-gray-400">
        Settings & Billing
      </div>
      <SidebarItem
        className="flex"
        isHighlighted={currentTab === SettingsTab.Appearance}
      >
        <button
          className="flex flex-1 items-center overflow-hidden overflow-ellipsis whitespace-nowrap px-4 py-1"
          onClick={() => setCurrentTab(SettingsTab.Appearance)}
        >
          <IconBrightnessHalf
            size={18}
            className="mr-1 text-gray-800 dark:text-gray-200"
          />
          <span>Appearance</span>
        </button>
      </SidebarItem>
      <SidebarItem
        className="flex"
        isHighlighted={currentTab === SettingsTab.Editor}
      >
        <button
          className="flex flex-1 items-center overflow-hidden overflow-ellipsis whitespace-nowrap px-4 py-1"
          onClick={() => setCurrentTab(SettingsTab.Editor)}
        >
          <IconPencil
            size={18}
            className="mr-1 text-gray-800 dark:text-gray-200"
          />
          <span>Editor</span>
        </button>
      </SidebarItem>
      <SidebarItem
        className="flex"
        isHighlighted={currentTab === SettingsTab.Billing}
      >
        <button
          className="flex flex-1 items-center overflow-hidden overflow-ellipsis whitespace-nowrap px-4 py-1"
          onClick={() => setCurrentTab(SettingsTab.Billing)}
        >
          <IconCreditCard
            size={18}
            className="mr-1 text-gray-800 dark:text-gray-200"
          />
          <span>Billing</span>
        </button>
      </SidebarItem>
    </div>
  );
};
