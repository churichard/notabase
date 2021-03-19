import React, { useEffect, useRef, useState } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { useAtom } from 'jotai';
import { addLinkPopoverAtom } from 'editor/state';
import { wrapLink } from 'editor/formatting';
import Popover from './Popover';

export default function AddLinkPopover() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [linkText, setLinkText] = useState<string>('');
  const [addLinkPopoverState, setAddLinkPopoverState] = useAtom(
    addLinkPopoverAtom
  );
  const editor = useSlate();

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
    >
      <input
        ref={inputRef}
        type="text"
        className="w-64 m-4 input"
        value={linkText}
        onChange={(e) => setLinkText(e.target.value)}
        placeholder="Enter link URL"
        onKeyPress={(event) => {
          if (
            event.key === 'Enter' &&
            linkText &&
            addLinkPopoverState.selection
          ) {
            // Restore the editor selection
            Transforms.select(editor, addLinkPopoverState.selection);
            // Insert the link
            insertLink(editor, linkText);
            // Focus the editor
            ReactEditor.focus(editor);
          }
        }}
        onBlur={() => {
          setAddLinkPopoverState({ isVisible: false, selection: null });
          setLinkText('');
        }}
      />
    </Popover>
  );
}

const insertLink = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};
