import type { ForwardedRef, KeyboardEvent } from 'react';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { TablerIcon } from '@tabler/icons';
import { IconFilePlus, IconSearch } from '@tabler/icons';
import { toast } from 'react-toastify';
import upsertNote from 'lib/api/upsertNote';
import { useAuth } from 'utils/useAuth';
import useNoteSearch from 'utils/useNoteSearch';
import { caseInsensitiveStringEqual } from 'utils/string';
import useFeature from 'utils/useFeature';
import { Feature } from 'constants/pricing';
import { useStore } from 'lib/store';
import UpgradeButton from './UpgradeButton';

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

type Props = {
  onOptionClick?: () => void;
  className?: string;
};

function FindOrCreateInput(props: Props, ref: ForwardedRef<HTMLInputElement>) {
  const { onOptionClick: onOptionClickCallback, className = '' } = props;
  const { user } = useAuth();
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const search = useNoteSearch({ numOfResults: 10 });
  const searchResults = useMemo(() => search(inputText), [search, inputText]);

  const options = useMemo(() => {
    const result: Array<Option> = [];
    // Show new note option if there isn't already a note called `inputText`
    // (We assume if there is a note, then it will be the first result)
    if (
      inputText &&
      (searchResults.length <= 0 ||
        !caseInsensitiveStringEqual(inputText, searchResults[0].item.title))
    ) {
      result.push({
        id: 'NEW_NOTE',
        type: OptionType.NEW_NOTE,
        text: `New note: ${inputText}`,
        icon: IconFilePlus,
      });
    }
    // Show notes that match `inputText`
    result.push(
      ...searchResults.map((result) => ({
        id: result.item.id,
        type: OptionType.NOTE,
        text: result.item.title,
      }))
    );
    return result;
  }, [searchResults, inputText]);

  const canCreateNote = useFeature(Feature.NumOfNotes);
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const onOptionClick = useCallback(
    async (option: Option) => {
      if (!user) {
        return;
      }

      onOptionClickCallback?.();

      if (option.type === OptionType.NEW_NOTE) {
        if (!canCreateNote) {
          setIsUpgradeModalOpen(true);
          return;
        }

        const note = await upsertNote({ user_id: user.id, title: inputText });
        if (!note) {
          toast.error(`There was an error creating the note ${inputText}.`);
          return;
        }

        router.push(`/app/note/${note.id}`);
      } else if (option.type === OptionType.NOTE) {
        router.push(`/app/note/${option.id}`);
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }
    },
    [
      user,
      router,
      canCreateNote,
      inputText,
      onOptionClickCallback,
      setIsUpgradeModalOpen,
    ]
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
          placeholder="Find or create a note"
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
  const canCreateNote = useFeature(Feature.NumOfNotes);

  const isDisabled = useMemo(
    () => !canCreateNote && option.type === OptionType.NEW_NOTE,
    [canCreateNote, option]
  );

  return (
    <button
      className={`flex w-full flex-row items-center px-4 py-2 text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
      } ${isDisabled ? 'text-gray-400 dark:text-gray-600' : ''}`}
      onClick={onClick}
    >
      {isDisabled ? (
        <UpgradeButton feature={Feature.NumOfNotes} className="mr-1" />
      ) : null}
      {option.icon ? (
        <option.icon size={18} className="mr-1 flex-shrink-0" />
      ) : null}
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {option.text}
      </span>
    </button>
  );
};

export default forwardRef(FindOrCreateInput);
