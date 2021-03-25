import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent,
  useCallback,
} from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { useAtom } from 'jotai';
import Fuse from 'fuse.js';
import useNoteTitles from 'api/useNoteTitles';
import { addLinkPopoverAtom } from 'editor/state';
import { insertLink } from 'editor/formatting';
import isUrl from 'utils/isUrl';
import Popover from './Popover';

enum OptionType {
  NOTE,
  NEW_NOTE,
  URL,
}

type Option =
  | { id: string; type: OptionType.NOTE; text: string; url: string }
  | { id: string; type: OptionType.URL; text: string; url: string }
  | { id: string; type: OptionType.NEW_NOTE; text: string };

export default function AddLinkPopover() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [linkText, setLinkText] = useState<string>('');
  const [addLinkPopoverState, setAddLinkPopoverState] = useAtom(
    addLinkPopoverAtom
  );
  const editor = useSlate();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const { data: notes = [] } = useNoteTitles();
  const fuse = useMemo(() => new Fuse(notes, { keys: ['title'] }), [notes]);
  const noteResults = useMemo(() => fuse.search(linkText).slice(0, 10), [
    fuse,
    linkText,
  ]);
  const options = useMemo(() => {
    const result: Array<Option> = [];
    if (linkText) {
      if (isUrl(linkText)) {
        result.push({
          id: 'url',
          type: OptionType.URL,
          text: linkText,
          url: linkText,
        });
      } else {
        result.push({
          id: 'newNote',
          type: OptionType.NEW_NOTE,
          text: linkText,
        });
      }
    }
    result.push(
      ...noteResults.map(({ item: note }) => ({
        id: note.id,
        type: OptionType.NOTE,
        text: note.title,
        url: `/app/note/${note.id}`,
      }))
    );
    return result;
  }, [noteResults, linkText]);

  useEffect(() => {
    if (!inputRef.current || !addLinkPopoverState.isVisible) {
      return;
    }
    inputRef.current.focus(); // Focus the input when it becomes visible
  }, [addLinkPopoverState.isVisible]);

  const hidePopover = useCallback(() => {
    setAddLinkPopoverState({ isVisible: false, selection: null });
    setLinkText('');
    setSelectedOptionIndex(0);
  }, [setAddLinkPopoverState]);

  const onOptionClick = useCallback(
    (option?: Option) => {
      if (!addLinkPopoverState.selection || !option) {
        return;
      }

      Transforms.select(editor, addLinkPopoverState.selection); // Restore the editor selection

      // Insert link
      if (option.type === OptionType.NOTE) {
        insertLink(editor, option.url, option.text);
      } else if (option.type === OptionType.URL) {
        insertLink(editor, option.url);
      } else if (option.type === OptionType.NEW_NOTE) {
        // TODO: Create new note and insert link
      }

      ReactEditor.focus(editor); // Focus the editor
      hidePopover();
    },
    [editor, addLinkPopoverState.selection, hidePopover]
  );

  const onKeyDown = useCallback(
    (event) => {
      // Update the selected option based on arrow key input
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedOptionIndex((index) => {
          return index <= 0 ? options.length - 1 : index - 1;
        });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedOptionIndex((index) => {
          return index >= options.length - 1 ? 0 : index + 1;
        });
      }
    },
    [options.length]
  );

  return (
    <Popover
      isVisibleOverride={addLinkPopoverState.isVisible}
      placement="bottom"
      className="flex flex-col py-4 w-96"
      onClickOutside={hidePopover}
    >
      <input
        ref={inputRef}
        type="text"
        className="mx-4 input"
        value={linkText}
        onChange={(e) => setLinkText(e.target.value)}
        placeholder="Enter link URL"
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            onOptionClick(options[selectedOptionIndex]);
          }
        }}
        onKeyDown={onKeyDown}
      />
      {options.length > 0 ? (
        <div className="mt-2">
          {options.map((option, index) => (
            <OptionItem
              key={option.id}
              option={option}
              isSelected={index === selectedOptionIndex}
              onClick={(event) => {
                if (event.button === 0) {
                  event.preventDefault();
                  onOptionClick(option);
                }
              }}
            />
          ))}
        </div>
      ) : null}
    </Popover>
  );
}

type OptionProps = {
  option: Option;
  isSelected: boolean;
  onClick: (event: MouseEvent) => void;
};

const OptionItem = (props: OptionProps) => {
  const { option, isSelected, onClick } = props;

  const prefixText = useMemo(() => {
    if (option.type === OptionType.URL) {
      return 'Link to url: ';
    } else if (option.type === OptionType.NEW_NOTE) {
      return 'New note: ';
    } else {
      return null;
    }
  }, [option.type]);

  return (
    <div
      key={option.id}
      className={`px-4 py-1 cursor-pointer hover:bg-gray-100 active:bg-gray-200 ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={onClick}
    >
      {prefixText ? <span className="italic">{prefixText}</span> : null}
      <span>{option.text}</span>
    </div>
  );
};
