import { memo, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Highlighter from 'react-highlight-words';
import useNoteSearch, { NoteBlock } from 'utils/useNoteSearch';
import useDebounce from 'utils/useDebounce';
import ErrorBoundary from '../ErrorBoundary';
import Tree from '../Tree';

const DEBOUNCE_MS = 500;

type Props = {
  className?: string;
};

export default function SidebarSearch(props: Props) {
  const { className } = props;
  const [inputText, setInputText] = useState('');

  const [searchQuery, setSearchQuery] = useDebounce(inputText, DEBOUNCE_MS);
  const search = useNoteSearch({ searchContent: true });

  const searchResultsData = useMemo(() => {
    const searchResults = search(searchQuery);
    return searchResults.map((result) => ({
      id: result.item.id,
      labelNode: <SidebarSearchBranch text={result.item.title} />,
      children: result.matches?.map((match, index) => ({
        id: `${result.item.id}-${index}`,
        labelNode: (
          <SidebarSearchLeaf
            noteId={result.item.id}
            text={match.value ?? ''}
            searchQuery={searchQuery}
            block={
              result.item.blocks && match.refIndex !== undefined
                ? result.item.blocks[match.refIndex]
                : undefined
            }
          />
        ),
        showArrow: false,
      })),
    }));
  }, [search, searchQuery]);

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
              setSearchQuery(inputText);
            }
          }}
          autoFocus
        />
        <div className="flex-1 overflow-y-auto">
          {!searchQuery || searchResultsData.length > 0 ? (
            <Tree className="px-1" data={searchResultsData} />
          ) : (
            <p className="px-4 text-gray-600">No results found.</p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

type SidebarSearchBranchProps = {
  text: string;
};

const SidebarSearchBranch = memo(function SidebarSearchBranch(
  props: SidebarSearchBranchProps
) {
  const { text } = props;
  return (
    <p className="py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
      {text}
    </p>
  );
});

type SidebarSearchLeafProps = {
  noteId: string;
  text: string;
  searchQuery: string;
  block?: NoteBlock;
};

const SidebarSearchLeaf = memo(function SidebarSearchLeaf(
  props: SidebarSearchLeafProps
) {
  const { noteId, text, searchQuery, block } = props;
  const router = useRouter();
  return (
    <button
      className={`w-full text-left rounded px-1 py-2 text-gray-800 hover:bg-gray-200 active:bg-gray-300`}
      onClick={() => {
        const hash = block ? `#${block.path}` : '';
        router.push(`/app/note/${noteId}${hash}`);
      }}
    >
      <Highlighter
        className="block text-xs text-gray-600 break-words"
        highlightClassName="bg-yellow-200"
        searchWords={[searchQuery]}
        autoEscape={true}
        textToHighlight={text}
      />
    </button>
  );
});
