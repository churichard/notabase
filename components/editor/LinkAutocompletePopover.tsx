import type { MouseEvent } from 'react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import type { TablerIcon } from '@tabler/icons';
import { insertNoteLink } from 'editor/formatting';
import { deleteText } from 'editor/transforms';
import { useAuth } from 'utils/useAuth';
import useNoteSearch from 'utils/useNoteSearch';
import useDebounce from 'utils/useDebounce';
import EditorPopover from './EditorPopover';

const DEBOUNCE_MS = 100;

enum OptionType {
  NOTE,
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
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const [inputText, setInputText] = useState('');
  const [linkText] = useDebounce(inputText, DEBOUNCE_MS);

  const search = useNoteSearch({ numOfResults: 10 });
  const searchResults = useMemo(() => search(linkText), [search, linkText]);

  const options = useMemo(
    () =>
      searchResults.map((result) => ({
        id: result.item.id,
        type: OptionType.NOTE,
        text: result.item.title,
      })),
    [searchResults]
  );

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
    setInputText(noteTitle);
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
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }

      hidePopover();
    },
    [editor, user, hidePopover, getRegexResult]
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

  return isVisible && options.length > 0 ? (
    <EditorPopover
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
    </EditorPopover>
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
      className={`flex flex-row items-center px-4 py-1 cursor-pointer text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
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
