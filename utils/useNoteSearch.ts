import { useCallback } from 'react';
import Fuse from 'fuse.js';
import { createEditor, Descendant, Editor, Node, Path } from 'slate';
import { Notes, store } from 'lib/store';
import withLinks from 'editor/plugins/withLinks';

type FlattenedContent = { text: string; path: Path }[];

type FuseDatum = {
  id: string;
  title: string;
  flattenedContent?: FlattenedContent;
};

type NoteSearchOptions = {
  numOfResults?: number;
  searchContent?: boolean;
};

export default function useNoteSearch({
  numOfResults = 10,
  searchContent = false,
}: NoteSearchOptions = {}) {
  const search = useCallback(
    (searchText: string) => {
      const fuse = initFuse(store.getState().notes, searchContent);
      return fuse.search(searchText, { limit: numOfResults });
    },
    [numOfResults, searchContent]
  );
  return search;
}

// Initializes Fuse
const initFuse = (notes: Notes, searchContent: boolean) => {
  const fuseData = getFuseData(notes, searchContent);
  const keys = searchContent ? ['flattenedContent.text'] : ['title'];
  return new Fuse(fuseData, {
    keys,
    ...(searchContent
      ? { includeMatches: true, ignoreLocation: true, threshold: 0 }
      : { threshold: 0.1 }),
  });
};

// Returns the data that should be passed in when instantiating the Fuse client.
const getFuseData = (notes: Notes, searchContent: boolean): FuseDatum[] => {
  return Object.values(notes).map((note) => ({
    id: note.id,
    title: note.title,
    ...(searchContent
      ? { flattenedContent: flattenContent(note.content) }
      : {}),
  }));
};

// Flatten the content into individual lines
const flattenContent = (content: Descendant[]): FlattenedContent => {
  const editor = withLinks(createEditor());
  editor.children = content;

  const blocks = Editor.nodes(editor, {
    at: [],
    match: (n) => !Editor.isEditor(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  });

  const result = [];
  for (const [node, path] of blocks) {
    const blockText = Node.string(node);
    result.push({ text: blockText, path });
  }
  return result;
};
