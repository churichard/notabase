import { useState } from 'react';
import { useRouter } from 'next/router';
import useNoteSearch from 'utils/useNoteSearch';
import ErrorBoundary from '../ErrorBoundary';

type Props = {
  className?: string;
};

export default function SidebarSearch(props: Props) {
  const { className } = props;
  const [inputText, setInputText] = useState('');
  const searchResults = useNoteSearch(inputText, { searchContent: true });
  const router = useRouter();

  return (
    <ErrorBoundary>
      <div className={`flex flex-col overflow-y-auto ${className}`}>
        <input
          type="text"
          className="block py-1 mx-3 my-2 bg-white border-gray-200 rounded"
          placeholder="Search notes"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          autoFocus
        />
        <div className="flex-1 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              className={`w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-200 active:bg-gray-300`}
              onClick={() => router.push(`/app/note/${result.item.id}`)}
            >
              <p className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                {result.item.title}
              </p>
              {result.matches?.map((match, index) => (
                <p
                  key={index}
                  className="overflow-hidden text-xs text-gray-600 overflow-ellipsis whitespace-nowrap my-0.5"
                >
                  {match.value}
                </p>
              ))}
            </button>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
