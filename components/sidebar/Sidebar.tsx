import { memo, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconAffiliate, IconSearch } from '@tabler/icons';
import { useTransition, animated } from '@react-spring/web';
import Tooltip from 'components/Tooltip';
import { isMobile } from 'utils/device';
import { useStore } from 'lib/store';
import { SPRING_CONFIG } from 'constants/spring';
import SidebarItem from './SidebarItem';
import SidebarContent from './SidebarContent';
import SidebarHeader from './SidebarHeader';

type Props = {
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

function Sidebar(props: Props) {
  const { setIsFindOrCreateModalOpen, setIsSettingsOpen, className } = props;

  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const hideSidebarOnMobile = useCallback(() => {
    if (isMobile()) {
      setIsSidebarOpen(false);
    }
  }, [setIsSidebarOpen]);

  const transition = useTransition<
    boolean,
    {
      transform: string;
      dspl: number;
      backgroundOpacity: number;
      backgroundColor: string;
    }
  >(isSidebarOpen, {
    initial: {
      transform: 'translateX(0%)',
      dspl: 1,
      backgroundOpacity: 0.3,
      backgroundColor: 'black',
    },
    from: {
      transform: 'translateX(-100%)',
      dspl: 0,
      backgroundOpacity: 0,
      backgroundColor: 'transparent',
    },
    enter: {
      transform: 'translateX(0%)',
      dspl: 1,
      backgroundOpacity: 0.3,
      backgroundColor: 'black',
    },
    leave: {
      transform: 'translateX(-100%)',
      dspl: 0,
      backgroundOpacity: 0,
      backgroundColor: 'transparent',
    },
    config: SPRING_CONFIG,
    expires: (item) => !item,
  });

  return transition(
    (styles, item) =>
      item && (
        <>
          {isMobile() ? (
            <animated.div
              className="fixed inset-0 z-10"
              style={{
                backgroundColor: styles.backgroundColor,
                opacity: styles.backgroundOpacity,
                display: styles.dspl.to((displ) =>
                  displ === 0 ? 'none' : 'initial'
                ),
              }}
              onClick={() => setIsSidebarOpen(false)}
            />
          ) : null}
          <animated.div
            className="fixed top-0 bottom-0 left-0 z-20 w-64 shadow-popover md:static md:z-0 md:shadow-none"
            style={{
              transform: styles.transform,
              display: styles.dspl.to((displ) =>
                displ === 0 ? 'none' : 'initial'
              ),
            }}
          >
            <div
              className={`flex h-full flex-none flex-col border-r bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${className}`}
            >
              <SidebarHeader setIsSettingsOpen={setIsSettingsOpen} />
              <FindOrCreateModalButton
                onClick={() => {
                  hideSidebarOnMobile();
                  setIsFindOrCreateModalOpen((isOpen) => !isOpen);
                }}
              />
              <GraphButton onClick={hideSidebarOnMobile} />
              <SidebarContent
                className="mt-3 flex-1 overflow-y-auto overflow-x-hidden"
                setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
              />
            </div>
          </animated.div>
        </>
      )
  );
}

type FindOrCreateModalButtonProps = {
  onClick: () => void;
};

const FindOrCreateModalButton = (props: FindOrCreateModalButtonProps) => {
  const { onClick } = props;
  return (
    <SidebarItem>
      <Tooltip
        content="Quickly jump to a note, or create a new note (Ctrl+P)"
        placement="right"
        touch={false}
      >
        <button
          className="flex w-full items-center px-6 py-1 text-left"
          onClick={onClick}
        >
          <IconSearch
            className="mr-1 flex-shrink-0 text-gray-800 dark:text-gray-300"
            size={20}
          />
          <span className="select-none overflow-x-hidden overflow-ellipsis whitespace-nowrap">
            Find or Create Note
          </span>
        </button>
      </Tooltip>
    </SidebarItem>
  );
};

type GraphButtonProps = {
  onClick: () => void;
};

const GraphButton = (props: GraphButtonProps) => {
  const { onClick } = props;
  const router = useRouter();

  return (
    <SidebarItem
      isHighlighted={router.pathname.includes('/app/graph')}
      onClick={onClick}
    >
      <Tooltip
        content="Visualization of all of your notes as a network (Ctrl+Shift+G)"
        placement="right"
        touch={false}
      >
        <span>
          <Link href="/app/graph">
            <a className="flex items-center px-6 py-1">
              <IconAffiliate
                className="mr-1 flex-shrink-0 text-gray-800 dark:text-gray-300"
                size={20}
              />
              <span className="select-none overflow-x-hidden overflow-ellipsis whitespace-nowrap">
                Graph View
              </span>
            </a>
          </Link>
        </span>
      </Tooltip>
    </SidebarItem>
  );
};

export default memo(Sidebar);
