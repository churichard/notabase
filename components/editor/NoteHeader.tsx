import React, { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import { IconDots, IconFileExport } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { saveAs } from 'file-saver';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import { store } from 'lib/store';
import serialize from 'editor/serialize';

export default function NoteHeader() {
  const currentNote = useCurrentNote();
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
    const serializedContent = `# ${note.title}\n\n${note.content
      .map((n) => serialize(n))
      .join('')}`;
    const blob = new Blob([serializedContent], {
      type: 'text/markdown;charset=utf-8',
    });
    saveAs(blob, `${note.title}.md`);
  }, [currentNote.id]);

  return (
    <div className="w-full px-4 py-1 text-right bg-white">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className="py-1 rounded hover:bg-gray-300 active:bg-gray-400">
              <div ref={menuButtonRef}>
                <IconDots className="text-gray-800" />
              </div>
            </Menu.Button>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-10 bg-white rounded w-52 shadow-popover"
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
                        <span>Export to markdown</span>
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
