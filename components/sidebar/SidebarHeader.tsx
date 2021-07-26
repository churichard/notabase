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
        <Menu.Button className="flex items-center justify-between w-full py-3 pl-6 text-left text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div className="flex items-center flex-1">
            <span className="mr-1 font-semibold">Notabase</span>
            <IconSelector size={18} className="text-gray-500" />
          </div>
          <Tooltip content="Collapse sidebar" placement="right">
            <span
              className="p-1 mr-2 rounded hover:bg-gray-300 active:bg-gray-400"
              onClick={() => setIsSidebarOpen(false)}
            >
              <IconChevronsLeft className="text-gray-500" />
            </span>
          </Tooltip>
        </Menu.Button>
        <Menu.Items className="absolute z-10 w-56 overflow-hidden bg-white rounded left-6 top-full shadow-popover">
          <p className="px-4 pt-2 pb-1 overflow-hidden text-xs text-gray-600 overflow-ellipsis">
            {user?.email}
          </p>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
                  active ? 'bg-gray-100' : ''
                }`}
                onClick={() => setIsSettingsOpen(true)}
              >
                <IconSettings size={18} className="mr-1" />
                <span>Settings & Billing</span>
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm border-t ${
                  active ? 'bg-gray-100' : ''
                }`}
                href="https://8z3pisyojx8.typeform.com/to/tXt36EQM"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconMessage size={18} className="mr-1" />
                <span>Give feedback</span>
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
                  active ? 'bg-gray-100' : ''
                }`}
                href="https://discord.gg/BQKNRu7nv5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandDiscord size={18} className="mr-1" />
                <span>Join our Discord</span>
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
                  active ? 'bg-gray-100' : ''
                }`}
                href="https://help.notabase.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconHelp size={18} className="mr-1" />
                <span>Help Center</span>
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
                  active ? 'bg-gray-100' : ''
                }`}
                href="mailto:hello@notabase.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconMail size={18} className="mr-1" />
                <span>Contact us</span>
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm border-t ${
                  active ? 'bg-gray-100' : ''
                }`}
                onClick={() => signOut()}
              >
                <IconLogout size={18} className="mr-1" />
                <span>Sign out</span>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}
