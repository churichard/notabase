import { useRef, useState, Dispatch, SetStateAction } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconSortDescending,
  IconCheck,
  IconPlus,
  IconDownload,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import { useStore } from 'lib/store';
import useImport from 'utils/useImport';
import { ReadableNameBySort, Sort } from 'lib/createUserSettingsSlice';
import Tooltip from 'components/Tooltip';

type Props = {
  noteSort: Sort;
  numOfNotes: number;
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function SidebarNotesFooter(props: Props) {
  const { noteSort, numOfNotes, setIsFindOrCreateModalOpen } = props;
  const onImport = useImport();

  const setNoteSort = useStore((state) => state.setNoteSort);

  return (
    <div className="flex items-center justify-between border-t dark:border-gray-700">
      <Tooltip content="Create a new note">
        <button
          className="p-1 mx-2 my-1 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
          onClick={() => setIsFindOrCreateModalOpen((isOpen) => !isOpen)}
        >
          <IconPlus size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </Tooltip>
      <span className="p-1 mx-2 my-1 text-xs text-gray-500 dark:text-gray-400">
        {numOfNotes} notes
      </span>
      <div className="mx-2 my-1">
        <SortDropdown currentSort={noteSort} setCurrentSort={setNoteSort} />
        <Tooltip content="Import">
          <button
            className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
            onClick={onImport}
          >
            <IconDownload
              size={16}
              className="text-gray-600 dark:text-gray-300"
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

type SortDropdownProps = {
  currentSort: Sort;
  setCurrentSort: (sort: Sort) => void;
};

const SortDropdown = (props: SortDropdownProps) => {
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
      <Tooltip content="Sort notes">
        <Menu.Button
          className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
          ref={buttonRef}
        >
          <IconSortDescending
            size={16}
            className="text-gray-600 dark:text-gray-300"
          />
        </Menu.Button>
      </Tooltip>
      <Menu.Items
        className="z-10 w-56 overflow-hidden bg-white rounded dark:bg-gray-800 shadow-popover"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {Object.values(Sort).map((sort, index, arr) => {
          const isActive = currentSort === sort;
          const showDivider = (index + 1) % 2 === 0 && index !== arr.length - 1;
          return (
            <Menu.Item key={sort}>
              {({ active }) => (
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-gray-800 dark:text-gray-200 text-sm ${
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
    </Menu>
  );
};
