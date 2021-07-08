import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import {
  IconSortDescending,
  IconDots,
  IconTrash,
  IconCheck,
  IconPlus,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import type { Note } from 'types/supabase';
import { store, useStore, deepEqual } from 'lib/store';
import deleteNote from 'lib/api/deleteNote';
import useBacklinks from 'editor/useBacklinks';
import { caseInsensitiveStringCompare } from 'utils/string';
import { ReadableNameBySort, Sort } from 'constants/userSettings';
import Portal from '../Portal';
import ErrorBoundary from '../ErrorBoundary';
import SidebarItem from './SidebarItem';

type SidebarNotesProps = {
  currentNoteId?: string;
  className?: string;
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function SidebarNotes(props: SidebarNotesProps) {
  const { currentNoteId, className, setIsFindOrCreateModalOpen } = props;

  const notes = useStore(
    (state) =>
      Object.values(state.notes).map((note) => ({
        id: note.id,
        title: note.title,
      })),
    deepEqual
  );

  const noteSort = useStore((state) => state.userSettings.noteSort);
  const setNoteSort = useStore((state) =>
    state.updateUserSettingByKey('noteSort')
  );

  const sortedNotes = useMemo(
    () =>
      notes.sort((n1, n2) => {
        if (noteSort === Sort.TitleDescending) {
          return caseInsensitiveStringCompare(n2.title, n1.title);
        } else {
          return caseInsensitiveStringCompare(n1.title, n2.title);
        }
      }),
    [notes, noteSort]
  );

  return (
    <ErrorBoundary>
      <div className={`flex flex-col flex-1 overflow-x-hidden ${className}`}>
        <div className="overflow-y-auto">
          {sortedNotes && sortedNotes.length > 0 ? (
            sortedNotes.map((note) => (
              <NoteLink
                key={note.id}
                note={note}
                isHighlighted={note.id === currentNoteId}
              />
            ))
          ) : (
            <p className="px-6 my-2 text-gray-500">No notes yet</p>
          )}
        </div>
        <div className="flex items-center justify-between border-t">
          <button
            className="p-1 mx-2 my-1 rounded hover:bg-gray-200 active:bg-gray-300"
            onClick={() => setIsFindOrCreateModalOpen((isOpen) => !isOpen)}
          >
            <IconPlus size={16} className="text-gray-600" />
          </button>
          <span className="p-1 mx-2 my-1 text-xs text-gray-500">
            {notes.length} notes
          </span>
          <SortDropdown currentSort={noteSort} setCurrentSort={setNoteSort} />
        </div>
      </div>
    </ErrorBoundary>
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
      <Menu.Button
        className="p-1 mx-2 my-1 rounded hover:bg-gray-200 active:bg-gray-300"
        ref={buttonRef}
      >
        <IconSortDescending size={16} className="text-gray-600" />
      </Menu.Button>
      <Menu.Items
        className="z-10 w-56 overflow-hidden bg-white rounded shadow-popover"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {Object.values(Sort).map((sort) => {
          const isActive = currentSort === sort;
          return (
            <Menu.Item key={sort}>
              {({ active }) => (
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-gray-800 text-sm ${
                    active ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setCurrentSort(sort)}
                >
                  <span className={isActive ? 'text-primary-600' : undefined}>
                    {ReadableNameBySort[sort]}
                  </span>
                  {isActive ? (
                    <IconCheck size={18} className="ml-1 text-primary-600" />
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

type NoteLinkProps = {
  note: Pick<Note, 'id' | 'title'>;
  isHighlighted?: boolean;
};

const NoteLink = (props: NoteLinkProps) => {
  const { note, isHighlighted } = props;
  return (
    <SidebarItem
      className="relative flex items-center justify-between group"
      isHighlighted={isHighlighted}
    >
      <Link href={`/app/note/${note.id}`}>
        <a className="flex-1 px-6 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {note.title}
        </a>
      </Link>
      <NoteLinkDropdown note={note} className="hidden group-hover:block" />
    </SidebarItem>
  );
};

type NoteLinkDropdownProps = {
  note: Pick<Note, 'id' | 'title'>;
  className?: string;
};

const NoteLinkDropdown = (props: NoteLinkDropdownProps) => {
  const { note, className } = props;
  const router = useRouter();
  const { deleteBacklinks } = useBacklinks(note.id);
  const openNoteIds = useStore((state) => state.openNoteIds);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    containerRef.current,
    popperElement,
    { placement: 'right' }
  );

  const onDeleteClick = useCallback(async () => {
    await deleteNote(note.id);
    await deleteBacklinks();

    const deletedNoteIndex = openNoteIds.findIndex(
      (openNoteId) => openNoteId === note.id
    );
    if (deletedNoteIndex !== -1) {
      // Redirect if one of the notes that was deleted was open
      const newNoteId = Object.keys(store.getState().notes)[0];
      router.push(`/app/note/${newNoteId}`, undefined, { shallow: true });
    }
  }, [router, note.id, openNoteIds, deleteBacklinks]);

  return (
    <div ref={containerRef}>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              className={`p-1 rounded hover:bg-gray-300 active:bg-gray-400 ${className}`}
            >
              <IconDots className="text-gray-600" />
            </Menu.Button>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-10 w-48 overflow-hidden bg-white rounded shadow-popover"
                  static
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
                          active ? 'bg-gray-100' : ''
                        }`}
                        onClick={onDeleteClick}
                      >
                        <IconTrash size={18} className="mr-1" />
                        <span>Delete</span>
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Portal>
            )}
          </>
        )}
      </Menu>
    </div>
  );
};
