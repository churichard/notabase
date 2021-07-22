import { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import {
  IconLogout,
  IconSelector,
  IconAffiliate,
  IconSearch,
  IconMail,
  IconMessage,
  IconChevronsLeft,
  IconBrandDiscord,
} from '@tabler/icons';
import { useAuth } from 'utils/useAuth';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import SidebarItem from './SidebarItem';
import SidebarContent from './SidebarContent';

type Props = {
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export default function Sidebar(props: Props) {
  const { setIsFindOrCreateModalOpen, className } = props;
  const router = useRouter();
  const currentNoteId = useMemo(() => {
    const id = router.query.id;
    return id && typeof id === 'string' ? id : undefined;
  }, [router]);

  return (
    <div
      className={`flex flex-col flex-none w-64 h-full border-r bg-gray-50 ${className}`}
    >
      <Header />
      <SidebarItem>
        <Tooltip
          content="Quickly jump to a note, or create a new note (Ctrl+P)"
          placement="right"
        >
          <button
            className="flex items-center w-full px-6 py-1 text-left"
            onClick={() => setIsFindOrCreateModalOpen((isOpen) => !isOpen)}
          >
            <IconSearch className="mr-1 text-gray-800" size={20} />
            <span>Find or Create Note</span>
          </button>
        </Tooltip>
      </SidebarItem>
      <SidebarItem isHighlighted={router.pathname.includes('/app/graph')}>
        <Tooltip
          content="Visualization of all of your notes as a network"
          placement="right"
        >
          <span>
            <Link href="/app/graph">
              <a className="flex items-center px-6 py-1">
                <IconAffiliate className="mr-1 text-gray-800" size={20} />
                <span>Graph View</span>
              </a>
            </Link>
          </span>
        </Tooltip>
      </SidebarItem>
      <SidebarContent
        className="flex-1 mt-3 overflow-x-hidden overflow-y-auto"
        currentNoteId={currentNoteId}
        setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
      />
    </div>
  );
}

const Header = () => {
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
          <p className="px-4 py-2 overflow-hidden text-xs text-gray-600 overflow-ellipsis">
            {user?.email}
          </p>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
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
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
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
};
