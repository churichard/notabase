import type { Dispatch, SetStateAction } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconLogout,
  IconSelector,
  IconMail,
  IconMessage,
  IconChevronsLeft,
  IconBrandDiscord,
  IconSettings,
  IconHelp,
} from '@tabler/icons';
import { useAuth } from 'utils/useAuth';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import { isMobile } from 'utils/device';
import { DropdownItem } from 'components/Dropdown';

type Props = {
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Header(props: Props) {
  const { setIsSettingsOpen } = props;
  const { user, signOut } = useAuth();
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);

  return (
    <div className="relative">
      <Menu>
        <Menu.Button className="flex items-center justify-between w-full py-2 pl-6 overflow-x-hidden text-left text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 overflow-ellipsis whitespace-nowrap focus:outline-none">
          <div className="flex items-center flex-1">
            <span className="mr-1 font-semibold select-none">Notabase</span>
            <IconSelector
              size={18}
              className="text-gray-500 dark:text-gray-400"
            />
          </div>
          <Tooltip content="Collapse sidebar (Ctrl+\)" placement="right">
            <span
              className="p-1 mr-2 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-600 dark:active:bg-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(false);
              }}
            >
              <IconChevronsLeft className="text-gray-500 dark:text-gray-400" />
            </span>
          </Tooltip>
        </Menu.Button>
        <Menu.Items className="absolute z-20 w-56 overflow-hidden bg-white rounded left-6 top-full shadow-popover dark:bg-gray-800 focus:outline-none">
          <p className="px-4 pt-2 pb-1 overflow-hidden text-xs text-gray-600 overflow-ellipsis dark:text-gray-400">
            {user?.email}
          </p>
          <DropdownItem
            onClick={() => {
              if (isMobile()) {
                setIsSidebarOpen(false);
              }
              setIsSettingsOpen(true);
            }}
          >
            <IconSettings size={18} className="mr-1" />
            <span>Settings & Billing</span>
          </DropdownItem>
          <DropdownItem
            as="a"
            className="border-t dark:border-gray-700"
            href="https://8z3pisyojx8.typeform.com/to/tXt36EQM"
          >
            <IconMessage size={18} className="mr-1" />
            <span>Give feedback</span>
          </DropdownItem>
          <DropdownItem as="a" href="https://discord.gg/BQKNRu7nv5">
            <IconBrandDiscord size={18} className="mr-1" />
            <span>Join our Discord</span>
          </DropdownItem>
          <DropdownItem as="a" href="https://help.notabase.io">
            <IconHelp size={18} className="mr-1" />
            <span>Help Center</span>
          </DropdownItem>
          <DropdownItem as="a" href="mailto:hello@notabase.io">
            <IconMail size={18} className="mr-1" />
            <span>Contact us</span>
          </DropdownItem>
          <DropdownItem
            className="border-t dark:border-gray-700"
            onClick={() => signOut()}
          >
            <IconLogout size={18} className="mr-1" />
            <span>Sign out</span>
          </DropdownItem>
        </Menu.Items>
      </Menu>
    </div>
  );
}
