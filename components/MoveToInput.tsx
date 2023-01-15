import type { ForwardedRef, KeyboardEvent } from 'react';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { IconChevronsUp, IconSearch, TablerIcon } from '@tabler/icons';
import { useAuth } from 'utils/useAuth';
import useNoteSearch from 'utils/useNoteSearch';
import supabase from 'lib/supabase';
import { store, useStore } from 'lib/store';
import { User } from 'types/supabase';
import { caseInsensitiveStringCompare } from 'utils/string';

enum OptionType {
  NOTE,
  ROOT,
}

type Option = {
  id: string;
  type: OptionType;
  text: string;
  icon?: TablerIcon;
};

type Props = {
  noteId: string;
  onOptionClick?: () => void;
  className?: string;
};

function MoveToInput(props: Props, ref: ForwardedRef<HTMLInputElement>) {
  const {
    noteId,
    onOptionClick: onOptionClickCallback,
    className = '',
  } = props;
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const noteTree = useStore((state) => state.noteTree);
  const moveNoteTreeItem = useStore((state) => state.moveNoteTreeItem);

  const search = useNoteSearch({ numOfResults: 10 });
  const searchResults = useMemo(() => search(inputText), [search, inputText]);

  const options = useMemo(() => {
    const result: Option[] = [];
    if (!inputText) {
      const notes = store.getState().notes;
      // Include the root and nine top-level notes sorted alphabetically
      result.push({
        id: 'root',
        type: OptionType.ROOT,
        text: 'Move to root',
        icon: IconChevronsUp,
      });
      result.push(
        ...noteTree
          .filter((item) => item.id !== noteId)
          .map((item) => ({
            id: item.id,
            type: OptionType.NOTE,
            text: notes[item.id].title,
          }))
          .sort((n1, n2) => caseInsensitiveStringCompare(n1.text, n2.text))
          .slice(0, 9)
      );
    } else {
      result.push(
        ...searchResults
          .filter((result) => result.item.id !== noteId)
          .map((result) => ({
            id: result.item.id,
            type: OptionType.NOTE,
            text: result.item.title,
          }))
      );
    }
    return result;
  }, [searchResults, noteId, inputText, noteTree]);

  const onOptionClick = useCallback(
    async (option: Option) => {
      if (!user) {
        return;
      }

      onOptionClickCallback?.();

      if (option.type === OptionType.ROOT) {
        moveNoteTreeItem(noteId, null);
      } else if (option.type === OptionType.NOTE) {
        moveNoteTreeItem(noteId, option.id);
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }

      await supabase
        .from<User>('users')
        .update({ note_tree: store.getState().noteTree })
        .eq('id', user.id);
    },
    [user, onOptionClickCallback, noteId, moveNoteTreeItem]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
    <div className={`flex flex-col ${className}`}>
      <div className="flex w-full flex-shrink-0 items-center">
        <IconSearch className="ml-4 text-gray-500" size={20} />
        <input
          ref={ref}
          type="text"
          className={`w-full rounded-tl rounded-tr border-none py-4 px-2 text-xl focus:ring-0 dark:bg-gray-800 dark:text-gray-200 ${
            options.length <= 0 ? 'rounded-bl rounded-br' : ''
          }`}
          placeholder="Search note to move to"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onKeyDown}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onOptionClick(options[selectedOptionIndex]);
            }
          }}
          autoFocus
        />
      </div>
      {options.length > 0 ? (
        <div className="w-full flex-1 overflow-y-auto rounded-bl rounded-br border-t bg-white dark:border-gray-700 dark:bg-gray-800">
          {options.map((option, index) => (
            <OptionItem
              key={option.id}
              option={option}
              isSelected={index === selectedOptionIndex}
              onClick={() => onOptionClick(option)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type OptionProps = {
  option: Option;
  isSelected: boolean;
  onClick: () => void;
};

const OptionItem = (props: OptionProps) => {
  const { option, isSelected, onClick } = props;
  return (
    <button
      className={`flex w-full flex-row items-center px-4 py-2 text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
      }`}
      onClick={onClick}
    >
      {option.icon ? (
        <option.icon size={18} className="mr-1 flex-shrink-0" />
      ) : null}
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {option.text}
      </span>
    </button>
  );
};

export default forwardRef(MoveToInput);
