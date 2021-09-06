import { useMemo, useState } from 'react';
import { IconBrightnessHalf, IconCreditCard } from '@tabler/icons';
import useHotkeys from 'utils/useHotkeys';
import SidebarItem from '../sidebar/SidebarItem';
import Billing from './Billing';
import Appearance from './Appearance';

enum SettingsTab {
  Appearance = 'appearance',
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
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={() => setIsOpen(false)}
      />
      <div className="flex items-center justify-center h-screen p-6">
        <div className="z-20 flex w-full h-full max-w-full bg-white rounded max-h-128 sm:w-192 xl:w-240 xl:max-h-176 shadow-popover">
          <SettingsModalSidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
          {currentTab === SettingsTab.Appearance ? <Appearance /> : null}
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
    <div className="flex flex-col flex-none w-48 h-full border-r bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 pt-4 pb-2 text-sm text-gray-600 dark:text-gray-400">
        Settings & Billing
      </div>
      <SidebarItem
        className="flex"
        isHighlighted={currentTab === SettingsTab.Appearance}
      >
        <button
          className="flex items-center flex-1 px-4 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
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
        isHighlighted={currentTab === SettingsTab.Billing}
      >
        <button
          className="flex items-center flex-1 px-4 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
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
