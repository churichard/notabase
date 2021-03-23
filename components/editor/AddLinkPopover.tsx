import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { useAtom } from 'jotai';
import useSWR from 'swr';
import Fuse from 'fuse.js';
import { GET_NOTE_TITLES_KEY } from 'api/note';
import { addLinkPopoverAtom } from 'editor/state';
import { wrapLink } from 'editor/formatting';
import { Note } from 'types/supabase';
import Popover from './Popover';

export default function AddLinkPopover() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [linkText, setLinkText] = useState<string>('');
  const [addLinkPopoverState, setAddLinkPopoverState] = useAtom(
    addLinkPopoverAtom
  );
  const editor = useSlate();

  const { data: notes = [] } = useSWR<Array<Note>>(GET_NOTE_TITLES_KEY);
  const fuse = useMemo(() => new Fuse(notes, { keys: ['title'] }), [notes]);
  const noteResults = useMemo(() => fuse.search(linkText).slice(0, 10), [
    fuse,
    linkText,
  ]);

  useEffect(() => {
    if (!inputRef.current || !addLinkPopoverState.isVisible) {
      return;
    }
    inputRef.current.focus(); // Focus the input when it becomes visible
  }, [addLinkPopoverState.isVisible]);

  return (
    <Popover
      isVisibleOverride={addLinkPopoverState.isVisible}
      placement="bottom"
      className="flex flex-col py-4 w-96"
    >
      <input
        ref={inputRef}
        type="text"
        className="mx-4 input"
        value={linkText}
        onChange={(e) => setLinkText(e.target.value)}
        placeholder="Enter link URL"
        onKeyPress={(event) => {
          if (
            event.key === 'Enter' &&
            linkText &&
            addLinkPopoverState.selection
          ) {
            Transforms.select(editor, addLinkPopoverState.selection); // Restore the editor selection
            insertWebsiteLink(editor, linkText); // Insert the link
            ReactEditor.focus(editor); // Focus the editor
          }
        }}
        onBlur={() => {
          setAddLinkPopoverState({ isVisible: false, selection: null });
          setLinkText('');
        }}
      />
      {noteResults && noteResults.length > 0 ? (
        <div className="mt-2">
          {noteResults.map(({ item }) => (
            <div
              key={item.id}
              className="px-4 py-1 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
              onMouseDown={(event) => event.preventDefault()}
              onMouseUp={(event) => {
                if (event.button === 0) {
                  event.preventDefault();
                  if (addLinkPopoverState.selection) {
                    Transforms.select(editor, addLinkPopoverState.selection); // Restore the editor selection
                    insertNoteLink(editor, item); // Insert the link
                    ReactEditor.focus(editor); // Focus the editor
                  }
                }
              }}
            >
              {item.title}
            </div>
          ))}
        </div>
      ) : null}
    </Popover>
  );
}

const insertWebsiteLink = (editor: ReactEditor, url: string) => {
  wrapLink(editor, url);
};

const insertNoteLink = (editor: ReactEditor, note: Note) => {
  wrapLink(editor, `/app/note/${note.id}`, note.title);
};
