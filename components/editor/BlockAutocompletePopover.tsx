import { useMemo, useState, useCallback, useEffect } from 'react';
import { Editor, Element, Path, Range, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import type { TablerIcon } from '@tabler/icons';
import { insertBlockReference } from 'editor/formatting';
import { deleteText } from 'editor/transforms';
import { useAuth } from 'utils/useAuth';
import useBlockSearch from 'utils/useBlockSearch';
import { createNodeId } from 'editor/plugins/withNodeId';
import { isReferenceableBlockElement } from 'editor/checks';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import useDebounce from 'utils/useDebounce';
import { getActiveOrTempEditor } from 'lib/activeEditorsStore';
import EditorPopover from './EditorPopover';

const DEBOUNCE_MS = 100;

enum OptionType {
  BLOCK,
}

type Option = {
  id: string;
  type: OptionType;
  text: string;
  noteId: string;
  noteTitle: string;
  path: Path;
  blockId: string | undefined;
  icon?: TablerIcon;
};

export default function BlockAutocompletePopover() {
  const { user } = useAuth();
  const editor = useSlate();

  const [isVisible, setIsVisible] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const [inputText, setInputText] = useState('');
  const [searchText] = useDebounce(inputText, DEBOUNCE_MS);

  const search = useBlockSearch({ numOfResults: 10 });
  const searchResults = useMemo(() => search(searchText), [search, searchText]);

  const options: Option[] = useMemo(() => {
    const currBlock = Editor.above(editor, {
      match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    });
    const currPath = currBlock ? currBlock[1] : [];
    return searchResults
      .filter((result) => !Path.equals(result.item.path, currPath))
      .map((result) => ({
        id: `${result.item.noteId}-${result.item.path.toString()}`,
        type: OptionType.BLOCK,
        text: result.item.text,
        blockId: result.item.id,
        noteId: result.item.noteId,
        noteTitle: result.item.noteTitle,
        path: result.item.path,
      }));
  }, [searchResults, editor]);

  const hidePopover = useCallback(() => {
    setIsVisible(false);
    setSelectedOptionIndex(0);
  }, []);

  const getRegexResult = useCallback(() => {
    const REGEX = /(?:^|\s)(\(\()(.+)/;
    const { selection } = editor;

    const returnValue: { result: RegExpMatchArray | null; onOwnLine: boolean } =
      { result: null, onOwnLine: false };

    if (!selection || !Range.isCollapsed(selection)) {
      return returnValue;
    }

    try {
      const { anchor } = selection;

      const elementStart = Editor.start(editor, anchor.path);
      const elementRange = { anchor, focus: elementStart };
      const elementText = Editor.string(editor, elementRange);

      const result = elementText.match(REGEX);
      if (result && result.length > 0) {
        returnValue.result = result;
        returnValue.onOwnLine = result[0] === elementText;
      }
      return returnValue;
    } catch (e) {
      return returnValue;
    }
  }, [editor]);

  useEffect(() => {
    const { result } = getRegexResult();

    if (!result) {
      hidePopover();
      return;
    }

    const [, , inputText] = result;
    setInputText(inputText);
    setIsVisible(true);
  }, [editor.children, getRegexResult, hidePopover]);

  const onOptionClick = useCallback(
    async (option?: Option) => {
      if (!option || !user) {
        return;
      }

      // Delete markdown text
      const { result: regexResult, onOwnLine } = getRegexResult();

      if (!regexResult || !editor.selection) {
        return;
      }
      const { path: selectionPath, offset: endOfSelection } =
        editor.selection.anchor;
      const [, startMark, blockText] = regexResult;

      deleteText(
        editor,
        selectionPath,
        endOfSelection,
        startMark.length + blockText.length
      );

      // Handle inserting block reference
      if (option.type === OptionType.BLOCK) {
        let blockId;

        // We still need this because there are cases where block ids might not exist
        if (!option.blockId) {
          // Generate block id if it doesn't exist
          blockId = createNodeId();

          // Set block id on the block
          const noteEditor = getActiveOrTempEditor(
            option.noteId,
            store.getState().notes[option.noteId].content
          );
          Transforms.setNodes(
            noteEditor,
            { id: blockId },
            {
              at: option.path,
              match: (n) =>
                Element.isElement(n) && isReferenceableBlockElement(n),
            }
          );

          // Update note locally
          store.getState().updateNote({
            id: option.noteId,
            content: noteEditor.children,
          });

          // Update note in database
          await supabase
            .from('notes')
            .update({ content: noteEditor.children })
            .eq('id', option.noteId);
        } else {
          blockId = option.blockId;
        }

        insertBlockReference(editor, blockId, onOwnLine);
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }

      hidePopover();
    },
    [editor, user, hidePopover, getRegexResult]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    if (isVisible && options.length > 0) {
      document.addEventListener('keydown', onKeyDown, true);

      return () => {
        document.removeEventListener('keydown', onKeyDown, true);
      };
    }
  }, [isVisible, onKeyDown, options.length]);

  return isVisible && options.length > 0 ? (
    <EditorPopover
      placement="bottom"
      className="flex w-96 flex-col"
      onClose={hidePopover}
    >
      {options.map((option, index) => (
        <OptionItem
          key={option.id}
          option={option}
          isSelected={index === selectedOptionIndex}
          onClick={() => onOptionClick(option)}
        />
      ))}
    </EditorPopover>
  ) : null;
}

type OptionProps = {
  option: Option;
  isSelected: boolean;
  onClick: () => void;
};

const OptionItem = (props: OptionProps) => {
  const { option, isSelected, onClick } = props;
  return (
    <div
      className={`flex cursor-pointer flex-row items-center px-4 py-1 text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
      }`}
      onPointerDown={(event) => event.preventDefault()}
      onPointerUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {option.icon ? (
        <option.icon size={18} className="mr-1 flex-shrink-0" />
      ) : null}
      <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        <div>{option.text}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {option.noteTitle}
        </div>
      </div>
    </div>
  );
};
