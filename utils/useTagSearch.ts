import { useCallback } from 'react';
import Fuse from 'fuse.js';
import { createEditor, Descendant, Editor, Element } from 'slate';
import { Notes, store } from 'lib/store';
import withLinks from 'editor/plugins/withLinks';
import withVoidElements from 'editor/plugins/withVoidElements';
import withTags from 'editor/plugins/withTags';
import { ElementType, Tag } from 'types/slate';

type FuseDatum = string;

type NoteSearchOptions = {
  numOfResults?: number;
};

export default function useTagSearch({
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
  return new Fuse<FuseDatum>(fuseData, {
    ignoreLocation: true,
    threshold: 0.1,
  });
};

// Returns the data that should be passed in when instantiating the Fuse client.
const getFuseData = (notes: Notes): FuseDatum[] => {
  const set = Object.values(notes).reduce<Set<FuseDatum>>((acc, currNote) => {
    for (const tag of flattenContent(currNote.content)) {
      acc.add(tag);
    }
    return acc;
  }, new Set());
  return Array.from(set);
};

// Flatten the content into individual lines
const flattenContent = (content: Descendant[]): string[] => {
  const editor = withVoidElements(withTags(withLinks(createEditor())));
  editor.children = content;

  const tags = Editor.nodes<Tag>(editor, {
    at: [],
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === ElementType.Tag,
    mode: 'lowest',
  });

  const result = [];
  for (const [node] of tags) {
    result.push(node.name);
  }
  return result;
};
