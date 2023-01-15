import { useRef, useState, memo } from 'react';
import { Menu } from '@headlessui/react';
import { IconSortDescending, IconCheck } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { ReadableNameBySort, Sort } from 'lib/createUserSettingsSlice';
import Tooltip from 'components/Tooltip';
import Portal from 'components/Portal';

type Props = {
  currentSort: Sort;
  setCurrentSort: (sort: Sort) => void;
};

const SidebarNotesSortDropdown = (props: Props) => {
  const { currentSort, setCurrentSort } = props;

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(buttonRef.current, popperElement, {
    placement: 'bottom-start',
  });

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            className="rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
            ref={buttonRef}
          >
            <Tooltip content="Sort notes">
              <span className="flex h-6 w-6 items-center justify-center">
                <IconSortDescending
                  size={16}
                  className="text-gray-600 dark:text-gray-300"
                />
              </span>
            </Tooltip>
          </Menu.Button>
          {open && (
            <Portal>
              <Menu.Items
                className="z-20 w-56 overflow-hidden rounded bg-white shadow-popover focus:outline-none dark:bg-gray-800"
                static
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                {Object.values(Sort).map((sort, index, arr) => {
                  const isActive = currentSort === sort;
                  const showDivider =
                    (index + 1) % 2 === 0 && index !== arr.length - 1;
                  return (
                    <Menu.Item key={sort}>
                      {({ active }) => (
                        <button
                          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-800 dark:text-gray-200 ${
                            showDivider ? 'border-b dark:border-gray-700' : ''
                          } ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                          onClick={() => setCurrentSort(sort)}
                        >
                          <span
                            className={
                              isActive
                                ? 'text-primary-600 dark:text-primary-400'
                                : undefined
                            }
                          >
                            {ReadableNameBySort[sort]}
                          </span>
                          {isActive ? (
                            <IconCheck
                              size={18}
                              className="ml-1 text-primary-600 dark:text-primary-400"
                            />
                          ) : null}
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
};

export default memo(SidebarNotesSortDropdown);
