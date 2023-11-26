import { useCallback } from 'react';
import Fuse from 'fuse.js';
import { createEditor, Descendant, Editor, Node, Path, Element } from 'slate';
import { Notes, store } from 'lib/store';
import withLinks from 'editor/plugins/withLinks';
import withTags from 'editor/plugins/withTags';
import withVoidElements from 'editor/plugins/withVoidElements';

export type NoteBlock = { text: string; path: Path };

type FuseDatum = {
  id: string;
  title: string;
  blocks?: NoteBlock[];
};

type NoteSearchOptions = {
  numOfResults?: number;
  searchContent?: boolean;
  extendedSearch?: boolean;
};

export default function useNoteSearch({
  numOfResults = -1,
  searchContent = false,
  extendedSearch = false,
}: NoteSearchOptions = {}) {
  const search = useCallback(
    (searchText: string) => {
      const fuse = initFuse(
        store.getState().notes,
        searchContent,
        extendedSearch
      );
      return fuse.search(searchText, { limit: numOfResults });
    },
    [numOfResults, searchContent, extendedSearch]
  );
  return search;
}

// Initializes Fuse
const initFuse = (
  notes: Notes,
  searchContent: boolean,
  extendedSearch: boolean
) => {
  const fuseData = getFuseData(notes, searchContent);
  const keys = searchContent ? ['blocks.text'] : ['title'];
  return new Fuse<FuseDatum>(fuseData, {
    useExtendedSearch: extendedSearch,
    keys,
    ignoreLocation: true,
    ...(searchContent
      ? {
          includeMatches: true,
          threshold: 0,
          sortFn: (a, b) => a.idx - b.idx,
        }
      : { threshold: 0.1 }),
  });
};

// Returns the data that should be passed in when instantiating the Fuse client.
const getFuseData = (notes: Notes, searchContent: boolean): FuseDatum[] => {
  return Object.values(notes).map(
    (note): FuseDatum => ({
      id: note.id,
      title: note.title,
      ...(searchContent ? { blocks: flattenContent(note.content) } : {}),
    })
  );
};

// Flatten the content into individual lines
const flattenContent = (content: Descendant[]): NoteBlock[] => {
  const editor = withVoidElements(withTags(withLinks(createEditor())));
  editor.children = content;

  const blocks = Editor.nodes(editor, {
    at: [],
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  });

  const result = [];
  for (const [node, path] of blocks) {
    const blockText = Node.string(node);
    result.push({ text: blockText, path });
  }
  return result;
};
