import { useCallback } from 'react';
import Fuse from 'fuse.js';
import { createEditor, Descendant, Editor, Element, Node, Path } from 'slate';
import { Notes, store } from 'lib/store';
import withLinks from 'editor/plugins/withLinks';
import withVoidElements from 'editor/plugins/withVoidElements';
import withTags from 'editor/plugins/withTags';

export type NoteBlock = {
  id?: string;
  text: string;
  path: Path;
  noteId: string;
  noteTitle: string;
};

type FuseDatum = NoteBlock;

type NoteSearchOptions = {
  numOfResults?: number;
};

export default function useBlockSearch({
  numOfResults = -1,
}: NoteSearchOptions = {}) {
  const search = useCallback(
    (searchText: string) => {
      const fuse = initFuse(store.getState().notes);
      return fuse.search(searchText, { limit: numOfResults });
    },
    [numOfResults]
  );
  return search;
}

// Initializes Fuse
const initFuse = (notes: Notes) => {
  const fuseData = getFuseData(notes);
  const keys = ['text'];
  return new Fuse<FuseDatum>(fuseData, {
    keys,
    ignoreLocation: true,
    threshold: 0.1,
  });
};

// Returns the data that should be passed in when instantiating the Fuse client.
const getFuseData = (notes: Notes): FuseDatum[] => {
  return Object.values(notes).reduce<FuseDatum[]>(
    (acc, currNote) => [
      ...acc,
      ...flattenContent(currNote.content, currNote.id, currNote.title),
    ],
    []
  );
};

// Flatten the content into individual lines
const flattenContent = (
  content: Descendant[],
  noteId: string,
  noteTitle: string
): NoteBlock[] => {
  const editor = withVoidElements(withTags(withLinks(createEditor())));
  editor.children = content;

  const blocks = Editor.nodes<Element>(editor, {
    at: [],
    match: (n) => !Editor.isEditor(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  });

  const result = [];
  for (const [node, path] of blocks) {
    const blockText = Node.string(node);
    result.push({ id: node.id, text: blockText, path, noteId, noteTitle });
  }
  return result;
};
