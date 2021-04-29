import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import { IconDots, IconTrash } from '@tabler/icons';
import { useAtom } from 'jotai';
import { Note } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import { openNotesAtom } from 'lib/state';
import deleteNote from 'lib/api/deleteNote';
import useBacklinks from 'editor/useBacklinks';
import SidebarInput from './SidebarInput';

type Props = {
  notes?: Array<Pick<Note, 'id' | 'title'>>;
  mainNoteId?: string;
};

export default function Sidebar(props: Props) {
  const { notes, mainNoteId } = props;
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-none w-64 h-full border-r border-gray-100 bg-gray-50">
      <Link href="/app">
        <a className="w-full px-6 py-3 text-gray-800 hover:bg-gray-200 active:bg-gray-300">
          <div className="font-medium">Notabase</div>
          <div className="text-sm">{user?.email}</div>
        </a>
      </Link>
      <SidebarInput />
      <div className="flex flex-col mt-2 overflow-y-auto">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <NoteLink key={note.id} note={note} mainNoteId={mainNoteId} />
          ))
        ) : (
          <p className="px-6 text-gray-500">No notes yet</p>
        )}
      </div>
    </div>
  );
}

type NoteLinkProps = {
  note: Pick<Note, 'id' | 'title'>;
  mainNoteId?: string;
};

function NoteLink(props: NoteLinkProps) {
  const { note, mainNoteId } = props;
  return (
    <div
      className={`group relative flex items-center justify-between w-full text-gray-800 hover:bg-gray-200 active:bg-gray-300 ${
        mainNoteId === note.id ? 'bg-gray-200' : 'bg-gray-50'
      }`}
    >
      <Link href={`/app/note/${note.id}`}>
        <a className="flex-1 px-6 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {note.title}
        </a>
      </Link>
      <NoteLinkDropdown note={note} />
    </div>
  );
}

type NoteLinkDropdownProps = {
  note: Pick<Note, 'id' | 'title'>;
};

function NoteLinkDropdown(props: NoteLinkDropdownProps) {
  const { note } = props;
  const router = useRouter();
  const { deleteBacklinks } = useBacklinks(note.id);
  const [openNotes] = useAtom(openNotesAtom);

  const onDeleteClick = useCallback(async () => {
    await deleteNote(note.id);
    await deleteBacklinks();

    if (
      openNotes.findIndex((openNote) => openNote.note.id === note.id) !== -1
    ) {
      // Redirect if one of the notes that was deleted was open
      router.push('/app');
    }
  }, [router, note.id, openNotes, deleteBacklinks]);

  return (
    <Menu>
      <Menu.Button className="hidden py-1 rounded group-hover:block hover:bg-gray-300 active:bg-gray-400">
        <IconDots className="text-gray-700" />
      </Menu.Button>
      <Menu.Items className="absolute top-0 right-0">
        <div className="fixed z-10 bg-white rounded shadow-popover">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`flex w-full items-center px-4 py-1 text-left ${
                  active ? 'bg-gray-100' : ''
                }`}
                onClick={onDeleteClick}
              >
                <IconTrash size={18} className="mr-1 text-gray-700" />
                <span>Delete</span>
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
