import { useMemo } from 'react';
import { IconCreditCard } from '@tabler/icons';
import useHotkeys from 'utils/useHotkeys';
import SidebarItem from './sidebar/SidebarItem';
import Billing from './Billing';

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export default function SettingsModal(props: Props) {
  const { setIsOpen } = props;

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
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className="fixed inset-0 z-10 bg-black opacity-30"
        onClick={() => setIsOpen(false)}
      />
      <div className="flex items-center justify-center h-screen p-6">
        <div className="z-20 flex w-full h-full max-w-full bg-white rounded max-h-128 sm:w-192 xl:w-240 xl:max-h-176 shadow-popover">
          <SettingsModalSidebar />
          <Billing />
        </div>
      </div>
    </div>
  );
}

const SettingsModalSidebar = () => {
  return (
    <div className="flex flex-col flex-none w-48 h-full border-r bg-gray-50">
      <div className="px-4 pt-4 pb-2 text-sm text-gray-600">
        Settings & Billing
      </div>
      <SidebarItem className="flex" isHighlighted={true}>
        <button className="flex items-center flex-1 px-4 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          <IconCreditCard size={18} className="mr-1 text-gray-800" />
          <span>Billing</span>
        </button>
      </SidebarItem>
    </div>
  );
};
