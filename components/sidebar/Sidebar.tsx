import { memo, useCallback, useMemo } from 'react';
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
  const router = useRouter();
  const currentNoteId = useMemo(() => {
    const id = router.query.id;
    return id && typeof id === 'string' ? id : undefined;
  }, [router]);

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
      width: string;
      dspl: number;
      opacity: number;
      backgroundOpacity: number;
      backgroundColor: string;
    }
  >(isSidebarOpen, {
    initial: {
      width: '16rem',
      dspl: 1,
      backgroundOpacity: 0.3,
      backgroundColor: 'black',
    },
    from: {
      width: '0rem',
      dspl: 0,
      backgroundOpacity: 0,
      backgroundColor: 'transparent',
    },
    enter: {
      width: '16rem',
      dspl: 1,
      backgroundOpacity: 0.3,
      backgroundColor: 'black',
    },
    leave: {
      width: '0rem',
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
            className="fixed top-0 bottom-0 left-0 z-20 shadow-popover md:shadow-none md:static md:z-0"
            style={{
              width: styles.width,
              display: styles.dspl.to((displ) =>
                displ === 0 ? 'none' : 'initial'
              ),
            }}
          >
            <div
              className={`flex flex-col flex-none h-full border-r bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 ${className}`}
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
                className="flex-1 mt-3 overflow-x-hidden overflow-y-auto"
                currentNoteId={currentNoteId}
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
          className="flex items-center w-full px-6 py-1 text-left"
          onClick={onClick}
        >
          <IconSearch
            className="flex-shrink-0 mr-1 text-gray-800 dark:text-gray-300"
            size={20}
          />
          <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
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
        content="Visualization of all of your notes as a network"
        placement="right"
        touch={false}
      >
        <span>
          <Link href="/app/graph">
            <a className="flex items-center px-6 py-1">
              <IconAffiliate
                className="flex-shrink-0 mr-1 text-gray-800 dark:text-gray-300 "
                size={20}
              />
              <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
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
