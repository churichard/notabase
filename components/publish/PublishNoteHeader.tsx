import { IconDots, IconLogin, IconX } from '@tabler/icons';
import { Menu } from '@headlessui/react';
import { useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { useCurrentNote } from 'utils/useCurrentNote';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import OpenSidebarButton from 'components/sidebar/OpenSidebarButton';
import useOnClosePane from 'utils/useOnClosePane';
import Portal from 'components/Portal';
import { DropdownItem } from 'components/Dropdown';
import Logo from 'components/Logo';

export default function PublishNoteHeader() {
  const currentNote = useCurrentNote();

  const isSidebarButtonVisible = useStore(
    (state) => !state.isSidebarOpen && state.openNoteIds?.[0] === currentNote.id
  );
  const isCloseButtonVisible = useStore(
    (state) => state.openNoteIds.length > 1
  );

  const onClosePane = useOnClosePane();

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="flex w-full items-center justify-between px-4 py-1 text-right">
      <div>{isSidebarButtonVisible ? <OpenSidebarButton /> : null}</div>
      <div>
        {isCloseButtonVisible ? (
          <Tooltip content="Close pane">
            <button
              className={buttonClassName}
              onClick={onClosePane}
              title="Close pane"
            >
              <span className="flex h-8 w-8 items-center justify-center">
                <IconX className={iconClassName} />
              </span>
            </button>
          </Tooltip>
        ) : null}
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                ref={menuButtonRef}
                className={buttonClassName}
                title="Options"
                data-testid="note-menu-button"
              >
                <Tooltip content="Options">
                  <span className="flex h-8 w-8 items-center justify-center">
                    <IconDots className={iconClassName} />
                  </span>
                </Tooltip>
              </Menu.Button>
              {open && (
                <Portal>
                  <Menu.Items
                    ref={setPopperElement}
                    data-testid="note-menu-button-dropdown"
                    className="z-10 w-52 overflow-hidden rounded bg-white shadow-popover focus:outline-none dark:bg-gray-800"
                    static
                    style={styles.popper}
                    {...attributes.popper}
                  >
                    <DropdownItem as="a" href="https://notabase.io">
                      <div className="flex items-center">
                        <Logo width={18} height={18} />
                        <span className="ml-2">Publish with Notabase</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      as="a"
                      href="https://notabase.io/signup"
                      className="border-t dark:border-gray-700"
                    >
                      <IconLogin size={18} className="mr-2" />
                      <span>Sign up / log in</span>
                    </DropdownItem>
                  </Menu.Items>
                </Portal>
              )}
            </>
          )}
        </Menu>
      </div>
    </div>
  );
}
