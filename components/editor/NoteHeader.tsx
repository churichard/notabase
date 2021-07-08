import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import { IconDots, IconFileExport, IconMenu2 } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import { store, useStore } from 'lib/store';
import serialize from 'editor/serialize';
import { Note } from 'types/supabase';

export default function NoteHeader() {
  const currentNote = useCurrentNote();

  const isSidebarButtonVisible = useStore(
    (state) => !state.isSidebarOpen && state.openNoteIds?.[0] === currentNote.id
  );
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);

  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const onExportClick = useCallback(async () => {
    const note = store.getState().notes[currentNote.id];
    saveAs(getNoteAsBlob(note), `${note.title}.md`);
  }, [currentNote.id]);

  const onExportAllClick = useCallback(async () => {
    const zip = new JSZip();

    const notes = Object.values(store.getState().notes);
    for (const note of notes) {
      zip.file(`${note.title}.md`, getNoteAsBlob(note));
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'notabase-export.zip');
  }, []);

  return (
    <div className="flex items-center justify-between w-full px-4 py-1 text-right bg-white">
      <div>
        {isSidebarButtonVisible ? (
          <button
            className="p-1 rounded hover:bg-gray-300 active:bg-gray-400"
            onClick={() => setIsSidebarOpen(true)}
          >
            <IconMenu2 className="text-gray-600" />
          </button>
        ) : null}
      </div>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className="p-1 rounded hover:bg-gray-300 active:bg-gray-400">
              <div ref={menuButtonRef}>
                <IconDots className="text-gray-600" />
              </div>
            </Menu.Button>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-10 overflow-hidden bg-white rounded shadow-popover"
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
                        onClick={onExportClick}
                      >
                        <IconFileExport size={18} className="mr-1" />
                        <span>Export to Markdown</span>
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
                          active ? 'bg-gray-100' : ''
                        }`}
                        onClick={onExportAllClick}
                      >
                        <IconFileExport size={18} className="mr-1" />
                        <span>Export all to Markdown</span>
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
}

const getSerializedNote = (note: Note) =>
  `# ${note.title}\n\n${note.content.map((n) => serialize(n)).join('')}`;

const getNoteAsBlob = (note: Note) => {
  const serializedContent = getSerializedNote(note);
  const blob = new Blob([serializedContent], {
    type: 'text/markdown;charset=utf-8',
  });
  return blob;
};
