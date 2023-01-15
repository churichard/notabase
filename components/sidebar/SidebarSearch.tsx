import { memo, useMemo } from 'react';
import { useRouter } from 'next/router';
import Highlighter from 'react-highlight-words';
import Fuse from 'fuse.js';
import useNoteSearch, { NoteBlock } from 'utils/useNoteSearch';
import useDebounce from 'utils/useDebounce';
import { useStore } from 'lib/store';
import ErrorBoundary from '../ErrorBoundary';
import VirtualTree from '../VirtualTree';

const DEBOUNCE_MS = 500;

type Props = {
  className?: string;
};

export default function SidebarSearch(props: Props) {
  const { className } = props;
  const inputText = useStore((state) => state.sidebarSearchQuery);
  const setInputText = useStore((state) => state.setSidebarSearchQuery);

  const [searchQuery, setSearchQuery] = useDebounce(inputText, DEBOUNCE_MS);
  const search = useNoteSearch({ searchContent: true, extendedSearch: true });

  const searchResultsData = useMemo(() => {
    const searchResults = search(searchQuery);
    return searchResults.map((result) => ({
      id: result.item.id,
      labelNode: <SidebarSearchBranch text={result.item.title} />,
      children: result.matches
        ? [...result.matches].sort(matchSort).map((match, index) => ({
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
          }))
        : undefined,
    }));
  }, [search, searchQuery]);

  return (
    <ErrorBoundary>
      <div className={`flex flex-1 flex-col overflow-y-auto ${className}`}>
        <input
          type="text"
          className="mx-4 my-2 block rounded border-gray-200 bg-white py-1 dark:border-gray-700 dark:bg-gray-700"
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
        {!searchQuery || searchResultsData.length > 0 ? (
          <VirtualTree
            className="flex-1 overflow-y-auto px-1"
            data={searchResultsData}
          />
        ) : (
          <p className="px-4 text-gray-600">No results found.</p>
        )}
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
    <p className="overflow-hidden overflow-ellipsis whitespace-nowrap py-1 dark:text-gray-200">
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
      className="w-full rounded text-left hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
      onClick={() => {
        const hash = block ? `#0-${block.path}` : '';
        router.push(`/app/note/${noteId}${hash}`);
      }}
    >
      <Highlighter
        className="block break-words px-1 py-2 text-xs text-gray-600 dark:text-gray-300"
        highlightClassName="bg-yellow-200 text-gray-600 dark:bg-yellow-800 dark:text-gray-300"
        searchWords={searchQuery.split(' ')}
        autoEscape={true}
        textToHighlight={text}
      />
    </button>
  );
});

const matchSort = (a: Fuse.FuseResultMatch, b: Fuse.FuseResultMatch) => {
  if (a.refIndex === undefined && b.refIndex === undefined) {
    return 0;
  } else if (a.refIndex === undefined) {
    return -1;
  } else if (b.refIndex === undefined) {
    return 1;
  } else {
    return a.refIndex - b.refIndex;
  }
};
