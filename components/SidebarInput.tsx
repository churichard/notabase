import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import upsertNote from 'lib/api/upsertNote';
import { useAuth } from 'utils/useAuth';
import useNoteSearch from 'utils/useNoteSearch';
import { caseInsensitiveStringEqual } from 'utils/string';

enum OptionType {
  NOTE,
  NEW_NOTE,
}

type Option = {
  id: string;
  type: OptionType;
  text: string;
};

export default function SidebarInput() {
  const { user } = useAuth();
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [inputText, setInputText] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const searchResults = useNoteSearch(inputText);
  const options = useMemo(() => {
    const result: Array<Option> = [];
    // Show new note option if there isn't already a note called `inputText`
    // (We assume if there is a note, then it will be the first result)
    if (
      inputText &&
      (searchResults.length <= 0 ||
        !caseInsensitiveStringEqual(inputText, searchResults[0].title))
    ) {
      result.push({
        id: 'NEW_NOTE',
        type: OptionType.NEW_NOTE,
        text: `New note: ${inputText}`,
      });
    }
    // Show notes that match `inputText`
    result.push(
      ...searchResults.map((note) => ({
        id: note.id,
        type: OptionType.NOTE,
        text: note.title,
      }))
    );
    return result;
  }, [searchResults, inputText]);

  const onOptionClick = async (option: Option) => {
    if (option.type === OptionType.NEW_NOTE) {
      if (!user) {
        return;
      }
      const note = await upsertNote({ user_id: user.id, title: inputText });
      if (!note) {
        return;
      }
      router.push(`/app/note/${note.id}`);
    } else if (option.type === OptionType.NOTE) {
      router.push(`/app/note/${option.id}`);
    } else {
      throw new Error(`Option type ${option.type} is not supported`);
    }
    setSelectedOptionIndex(0);
    setInputText('');
  };

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
    <div className="relative mx-6 my-2">
      <input
        type="text"
        className="w-full input"
        placeholder="Find or create note"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={onKeyDown}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onOptionClick(options[selectedOptionIndex]);
          }
        }}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />
      {options.length > 0 && isInputFocused ? (
        <div className="absolute z-10 bg-white border rounded shadow-popover w-96">
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
      className={`flex flex-row w-full items-center px-4 py-1 cursor-pointer hover:bg-gray-100 active:bg-gray-200 ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onClick={onClick}
    >
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {option.text}
      </span>
    </button>
  );
};
