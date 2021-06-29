import { useState } from 'react';
import { useRouter } from 'next/router';
import Highlighter from 'react-highlight-words';
import useNoteSearch from 'utils/useNoteSearch';
import useDebounce from 'utils/useDebounce';
import ErrorBoundary from '../ErrorBoundary';

const DEBOUNCE_MS = 500;

type Props = {
  className?: string;
};

export default function SidebarSearch(props: Props) {
  const { className } = props;
  const [inputText, setInputText] = useState('');

  const [debouncedInputText, setDebouncedInputText] = useDebounce(
    inputText,
    DEBOUNCE_MS
  );
  const searchResults = useNoteSearch(debouncedInputText, {
    searchContent: true,
  });

  const router = useRouter();

  return (
    <ErrorBoundary>
      <div className={`flex flex-col overflow-y-auto ${className}`}>
        <input
          type="text"
          className="block py-1 mx-4 my-2 bg-white border-gray-200 rounded"
          placeholder="Search notes"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setDebouncedInputText(inputText);
            }
          }}
          autoFocus
        />
        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 active:bg-gray-300`}
                onClick={() => router.push(`/app/note/${result.item.id}`)}
              >
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {result.item.title}
                </p>
                {result.matches?.map((match, index) => (
                  <Highlighter
                    key={index}
                    className="block mt-2 text-xs text-gray-600 break-words"
                    highlightClassName="bg-yellow-200"
                    searchWords={[debouncedInputText]}
                    autoEscape={true}
                    textToHighlight={match.value ?? ''}
                  />
                ))}
              </button>
            ))
          ) : (
            <p className="px-4 text-gray-600">No results found.</p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
