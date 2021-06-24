import type { MouseEvent } from 'react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import type { TablerIcon } from '@tabler/icons';
import { IconFilePlus } from '@tabler/icons';
import { v4 as uuidv4 } from 'uuid';
import upsertNote from 'lib/api/upsertNote';
import { insertNoteLink } from 'editor/formatting';
import { deleteText } from 'editor/transforms';
import { useAuth } from 'utils/useAuth';
import useNoteSearch from 'utils/useNoteSearch';
import { caseInsensitiveStringEqual } from 'utils/string';
import Popover from './Popover';

enum OptionType {
  NOTE,
  NEW_NOTE,
}

type Option = {
  id: string;
  type: OptionType;
  text: string;
  icon?: TablerIcon;
};

export default function LinkAutocompletePopover() {
  const { user } = useAuth();
  const editor = useSlate();

  const [isVisible, setIsVisible] = useState(false);
  const [linkText, setLinkText] = useState('');

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const searchResults = useNoteSearch(linkText);
  const options = useMemo(() => {
    const result: Array<Option> = [];
    if (linkText) {
      // Show new note option if there isn't already a note called `linkText`
      // (We assume if there is a note, then it will be the first result)
      if (
        searchResults.length <= 0 ||
        !caseInsensitiveStringEqual(linkText, searchResults[0].title)
      ) {
        result.push({
          id: 'NEW_NOTE',
          type: OptionType.NEW_NOTE,
          text: `New note: ${linkText}`,
          icon: IconFilePlus,
        });
      }
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
  }, [searchResults, linkText]);

  const hidePopover = useCallback(() => {
    setIsVisible(false);
    setSelectedOptionIndex(0);
  }, []);

  const getRegexResult = useCallback(() => {
    const REGEX = /(?:^|\s)(\[\[)(.+)/;
    const { selection } = editor;

    if (!selection || !Range.isCollapsed(selection)) {
      return null;
    }

    try {
      const { anchor } = selection;

      const elementStart = Editor.start(editor, anchor.path);
      const elementRange = { anchor, focus: elementStart };
      const elementText = Editor.string(editor, elementRange);

      const result = elementText.match(REGEX);
      return result ?? null;
    } catch (e) {
      return null;
    }
  }, [editor]);

  useEffect(() => {
    const result = getRegexResult();

    if (!result) {
      hidePopover();
      return;
    }

    const [, , noteTitle] = result;
    setLinkText(noteTitle);
    setIsVisible(true);
  }, [editor.children, getRegexResult, hidePopover]);

  const onOptionClick = useCallback(
    async (option?: Option) => {
      if (!option || !user) {
        return;
      }

      // Delete markdown text
      const regexResult = getRegexResult();

      if (!regexResult || !editor.selection) {
        return;
      }
      const { path: selectionPath, offset: endOfSelection } =
        editor.selection.anchor;
      const [, startMark, noteTitle] = regexResult;

      deleteText(
        editor,
        selectionPath,
        endOfSelection,
        startMark.length + noteTitle.length
      );

      // Handle inserting note link
      if (option.type === OptionType.NOTE) {
        // Insert a link to an existing note with the note title as the link text
        insertNoteLink(editor, option.id, option.text);
        Transforms.move(editor, { distance: 1, unit: 'offset' }); // Focus after the note link
      } else if (option.type === OptionType.NEW_NOTE) {
        // Add a new note and insert a link to it with the note title as the link text
        const noteId = uuidv4();
        insertNoteLink(editor, noteId, linkText);
        upsertNote({ id: noteId, user_id: user.id, title: linkText });
        Transforms.move(editor, { distance: 1, unit: 'offset' }); // Focus after the note link
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }

      hidePopover();
    },
    [editor, user, hidePopover, linkText, getRegexResult]
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
      } else if (event.key === 'Enter') {
        // We need both preventDefault and stopPropagation to prevent an enter being added
        event.preventDefault();
        event.stopPropagation();
        onOptionClick(options[selectedOptionIndex]);
      }
    },
    [onOptionClick, options, selectedOptionIndex]
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', onKeyDown, true);

      return () => {
        document.removeEventListener('keydown', onKeyDown, true);
      };
    }
  }, [isVisible, onKeyDown]);

  return isVisible ? (
    <Popover
      placement="bottom"
      className="flex flex-col w-96"
      onClose={hidePopover}
    >
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
    </Popover>
  ) : null;
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
      className={`flex flex-row items-center px-4 py-1 cursor-pointer text-gray-800 hover:bg-gray-100 active:bg-gray-200 ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={onClick}
    >
      {option.icon ? (
        <option.icon size={18} className="flex-shrink-0 mr-1" />
      ) : null}
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {option.text}
      </span>
    </div>
  );
};
