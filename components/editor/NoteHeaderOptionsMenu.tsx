import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconDots,
  IconDownload,
  IconUpload,
  IconCloudDownload,
  IconTrash,
  IconCornerDownRight,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Portal from 'components/Portal';
import { store, useStore } from 'lib/store';
import serialize from 'editor/serialization/serialize';
import { Note } from 'types/supabase';
import useImport from 'utils/useImport';
import Tooltip from 'components/Tooltip';
import { DropdownItem } from 'components/Dropdown';
import useDeleteNote from 'utils/useDeleteNote';
import NoteMetadata from 'components/NoteMetadata';
import { useCurrentNote } from 'utils/useCurrentNote';

type Props = {
  setIsMoveToModalOpen: (isOpen: boolean) => void;
};

export default function NoteHeaderOptionsMenu(props: Props) {
  const { setIsMoveToModalOpen } = props;

  const currentNote = useCurrentNote();
  const note = useStore((state) => state.notes[currentNote.id]);

  const onImport = useImport();

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const onExportClick = useCallback(async () => {
    saveAs(getNoteAsBlob(note), `${note.title}.md`);
  }, [note]);

  const onExportAllClick = useCallback(async () => {
    const zip = new JSZip();

    const notes = Object.values(store.getState().notes);
    for (const note of notes) {
      zip.file(`${note.title}.md`, getNoteAsBlob(note));
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'notabase-export.zip');
  }, []);

  const onDeleteClick = useDeleteNote(currentNote.id);

  const onMoveToClick = useCallback(
    () => setIsMoveToModalOpen(true),
    [setIsMoveToModalOpen]
  );

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            ref={menuButtonRef}
            className={buttonClassName}
            title="Options (export, import, etc.)"
            data-testid="note-menu-button"
          >
            <Tooltip content="Options (export, import, etc.)">
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
                className="z-10 w-56 overflow-hidden rounded bg-white shadow-popover focus:outline-none dark:bg-gray-800"
                static
                style={styles.popper}
                {...attributes.popper}
              >
                <DropdownItem onClick={onImport}>
                  <IconDownload size={18} className="mr-1" />
                  <span>Import</span>
                </DropdownItem>
                <DropdownItem onClick={onExportClick}>
                  <IconUpload size={18} className="mr-1" />
                  <span>Export</span>
                </DropdownItem>
                <DropdownItem onClick={onExportAllClick}>
                  <IconCloudDownload size={18} className="mr-1" />
                  <span>Export All</span>
                </DropdownItem>
                <DropdownItem
                  onClick={onDeleteClick}
                  className="border-t dark:border-gray-700"
                >
                  <IconTrash size={18} className="mr-1" />
                  <span>Delete</span>
                </DropdownItem>
                <DropdownItem onClick={onMoveToClick}>
                  <IconCornerDownRight size={18} className="mr-1" />
                  <span>Move to</span>
                </DropdownItem>
                <NoteMetadata note={note} />
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
}

const getSerializedNote = (note: Note) =>
  note.content.map((n) => serialize(n)).join('');

const getNoteAsBlob = (note: Note) => {
  const serializedContent = getSerializedNote(note);
  const blob = new Blob([serializedContent], {
    type: 'text/markdown;charset=utf-8',
  });
  return blob;
};
