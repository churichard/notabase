import type { Dispatch, SetStateAction } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconLogout,
  IconSelector,
  IconMail,
  IconMessage,
  IconChevronsLeft,
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
        <Menu.Button className="flex w-full items-center justify-between overflow-x-hidden overflow-ellipsis whitespace-nowrap py-2 pl-6 text-left text-gray-800 hover:bg-gray-200 focus:outline-none active:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600">
          <div className="flex flex-1 items-center">
            <span className="mr-1 select-none font-semibold">Notabase</span>
            <IconSelector
              size={18}
              className="text-gray-500 dark:text-gray-400"
            />
          </div>
          <Tooltip content="Collapse sidebar (Ctrl+\)" placement="right">
            <span
              className="mr-2 rounded p-1 hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-600 dark:active:bg-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(false);
              }}
            >
              <IconChevronsLeft className="text-gray-500 dark:text-gray-400" />
            </span>
          </Tooltip>
        </Menu.Button>
        <Menu.Items className="absolute left-6 top-full z-20 w-56 overflow-hidden rounded bg-white shadow-popover focus:outline-none dark:bg-gray-800">
          <p className="overflow-hidden overflow-ellipsis px-4 pt-2 pb-1 text-xs text-gray-600 dark:text-gray-400">
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
          <DropdownItem
            as="a"
            href="https://notabase.io/publish/ed280468-4096-4b21-8298-4a97c4eb990e/note/59df6332-0356-4c06-83ba-a90682ab18fc/"
          >
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
