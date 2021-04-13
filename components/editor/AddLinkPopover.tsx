import React, {
  useMemo,
  useRef,
  useState,
  MouseEvent,
  useCallback,
} from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { useAtom } from 'jotai';
import {
  IFluentIconsProps,
  Delete20Regular,
  Link20Regular,
  DocumentAdd20Regular,
} from '@fluentui/react-icons';
import { v4 as uuidv4 } from 'uuid';
import getOrAddNote from 'lib/api/getOrAddNote';
import { addLinkPopoverAtom } from 'editor/state';
import {
  insertExternalLink,
  insertNoteLink,
  removeLink,
} from 'editor/formatting';
import isUrl from 'utils/isUrl';
import { useAuth } from 'utils/useAuth';
import useNoteSearch from 'utils/useNoteSearch';
import { caseInsensitiveStringEqual } from 'utils/string';
import Popover from './Popover';

enum OptionType {
  NOTE,
  NEW_NOTE,
  URL,
  REMOVE_LINK,
}

type Option = {
  id: string;
  type: OptionType;
  text: string;
  icon?: (props: IFluentIconsProps) => JSX.Element;
};

export default function AddLinkPopover() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [linkText, setLinkText] = useState<string>('');
  const [addLinkPopoverState, setAddLinkPopoverState] = useAtom(
    addLinkPopoverAtom
  );
  const editor = useSlate();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const searchResults = useNoteSearch(linkText);
  const options = useMemo(() => {
    const result: Array<Option> = [];
    if (linkText) {
      // Show url option if `linkText` is a url
      if (isUrl(linkText)) {
        result.push({
          id: 'URL',
          type: OptionType.URL,
          text: `Link to url: ${linkText}`,
          icon: Link20Regular,
        });
      }
      // Show new note option if there isn't already a note called `linkText`
      // (We assume if there is a note, then it will be the first result)
      else if (
        searchResults.length <= 0 ||
        !caseInsensitiveStringEqual(linkText, searchResults[0].title)
      ) {
        result.push({
          id: 'NEW_NOTE',
          type: OptionType.NEW_NOTE,
          text: `New note: ${linkText}`,
          icon: DocumentAdd20Regular,
        });
      }
    }
    // Show remove link option if there is no `linkText` and the selected text is part of a link
    else if (addLinkPopoverState.isLink) {
      result.push({
        id: 'REMOVE_LINK',
        type: OptionType.REMOVE_LINK,
        text: 'Remove link',
        icon: Delete20Regular,
      });
    }
    // Show notes that match `linkText`
    result.push(
      ...searchResults.map((note) => ({
        id: note.id,
        type: OptionType.NOTE,
        text: note.title,
      }))
    );
    return result;
  }, [addLinkPopoverState.isLink, searchResults, linkText]);

  const hidePopover = useCallback(
    () =>
      setAddLinkPopoverState({
        isVisible: false,
        selection: undefined,
        isLink: false,
      }),
    [setAddLinkPopoverState]
  );

  const onOptionClick = useCallback(
    async (option?: Option) => {
      if (!addLinkPopoverState.selection || !option || !user) {
        return;
      }

      Transforms.select(editor, addLinkPopoverState.selection); // Restore the editor selection

      if (option.type === OptionType.NOTE) {
        // Insert a link to an existing note with the note title as the link text
        insertNoteLink(editor, option.id, option.text);
      } else if (option.type === OptionType.URL) {
        // Insert a link to a url
        insertExternalLink(editor, linkText);
      } else if (option.type === OptionType.NEW_NOTE) {
        // Add a new note and insert a link to it with the note title as the link text
        const noteId = uuidv4();
        insertNoteLink(editor, noteId, linkText);
        getOrAddNote(user.id, linkText, noteId);
      } else if (option.type === OptionType.REMOVE_LINK) {
        // Remove the link
        removeLink(editor);
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }

      ReactEditor.focus(editor); // Focus the editor
      hidePopover();
    },
    [editor, user, addLinkPopoverState.selection, hidePopover, linkText]
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
      selection={addLinkPopoverState.selection}
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
        placeholder="Enter link URL or search for a note"
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onOptionClick(options[selectedOptionIndex]);
          }
        }}
        onKeyDown={onKeyDown}
        autoFocus
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
  return (
    <div
      className={`flex flex-row items-center px-4 py-1 cursor-pointer hover:bg-gray-100 active:bg-gray-200 ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={onClick}
    >
      {option.icon ? <option.icon className="flex-shrink-0 mr-1" /> : null}
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {option.text}
      </span>
    </div>
  );
};
