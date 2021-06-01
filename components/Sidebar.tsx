import React, { useCallback, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import {
  IconDots,
  IconLogout,
  IconSelector,
  IconTrash,
  IconAffiliate,
  IconSearch,
  IconMail,
  IconMessage,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import type { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import { caseInsensitiveStringCompare } from 'utils/string';
import { deepIsEqual, useStore } from 'lib/store';
import deleteNote from 'lib/api/deleteNote';
import useBacklinks from 'editor/useBacklinks';
import Portal from './Portal';

type Props = {
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Sidebar(props: Props) {
  const { setIsFindOrCreateModalOpen } = props;
  const notes = useStore(
    (state) =>
      Object.values(state.notes)
        .map((note) => ({ id: note.id, title: note.title }))
        .sort((n1, n2) => caseInsensitiveStringCompare(n1.title, n2.title)),
    deepIsEqual
  );
  const router = useRouter();
  const queryNoteId = router.query.id;

  return (
    <div className="flex flex-col flex-none w-64 h-full border-r bg-gray-50">
      <Header />
      <SidebarItem>
        <button
          className="flex items-center w-full px-6 py-1 text-left"
          onClick={() => setIsFindOrCreateModalOpen((isOpen) => !isOpen)}
        >
          <IconSearch className="mr-1 text-gray-800" size={20} />
          <span>Find or create note</span>
        </button>
      </SidebarItem>
      <SidebarItem isHighlighted={router.pathname.includes('/app/graph')}>
        <Link href="/app/graph">
          <a className="flex items-center px-6 py-1">
            <IconAffiliate className="mr-1 text-gray-800" size={20} />
            <span>Graph View</span>
          </a>
        </Link>
      </SidebarItem>
      <div className="flex flex-col mt-3 overflow-x-hidden overflow-y-auto">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <NoteLink
              key={note.id}
              note={note}
              isHighlighted={note.id === queryNoteId}
            />
          ))
        ) : (
          <p className="px-6 text-gray-500">No notes yet</p>
        )}
      </div>
    </div>
  );
}

const Header = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="relative">
      <Menu>
        <Menu.Button className="flex items-center justify-between w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div>
            <p className="font-medium">Notabase</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <IconSelector size={18} className="text-gray-500" />
        </Menu.Button>
        <Menu.Items className="absolute z-10 w-56 bg-white rounded left-6 top-full shadow-popover">
          <Menu.Item>
            {({ active }) => (
              <a
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
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
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
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
                className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
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

type SidebarItemProps = {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
};

const SidebarItem = (props: SidebarItemProps) => {
  const { children, className, isHighlighted } = props;
  return (
    <div
      className={`w-full text-gray-800 hover:bg-gray-200 active:bg-gray-300 ${className} ${
        isHighlighted ? 'bg-gray-200' : 'bg-gray-50'
      }`}
    >
      {children}
    </div>
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
      <NoteLinkDropdown note={note} />
    </SidebarItem>
  );
};

type NoteLinkDropdownProps = {
  note: Pick<Note, 'id' | 'title'>;
};

const NoteLinkDropdown = (props: NoteLinkDropdownProps) => {
  const { note } = props;
  const router = useRouter();
  const { deleteBacklinks } = useBacklinks(note.id);
  const openNoteIds = useStore((state) => state.openNoteIds);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] =
    useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(
    containerRef.current,
    popperElement,
    { placement: 'right' }
  );

  const onDeleteClick = useCallback(async () => {
    await deleteNote(note.id);
    await deleteBacklinks();

    if (openNoteIds.findIndex((openNoteId) => openNoteId === note.id) !== -1) {
      // Redirect if one of the notes that was deleted was open
      router.push('/app');
    }
  }, [router, note.id, openNoteIds, deleteBacklinks]);

  return (
    <div ref={containerRef}>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className="hidden py-1 rounded group-hover:block hover:bg-gray-300 active:bg-gray-400">
              <IconDots className="text-gray-800" />
            </Menu.Button>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-10 w-48 bg-white rounded shadow-popover"
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
