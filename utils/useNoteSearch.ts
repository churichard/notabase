import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { createEditor, Descendant, Editor, Node } from 'slate';
import { deepEqual, useStore } from 'lib/store';
import withLinks from 'editor/plugins/withLinks';

type NoteSearchOptions = {
  numOfResults?: number;
  searchContent?: boolean;
};

export default function useNoteSearch(
  searchText: string,
  options: NoteSearchOptions = {}
) {
  const { numOfResults = 10, searchContent = false } = options;

  const notes = useStore(
    (state) =>
      Object.values(state.notes).map((note) => ({
        id: note.id,
        title: note.title,
        ...(searchContent
          ? { flattenedContent: flattenContent(note.content) }
          : {}),
      })),
    deepEqual
  );

  const keys = useMemo(
    () => (searchContent ? ['flattenedContent.text'] : ['title']),
    [searchContent]
  );
  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys,
        ...(searchContent
          ? { includeMatches: true, ignoreLocation: true, threshold: 0 }
          : { threshold: 0.1 }),
      }),
    [notes, keys, searchContent]
  );

  const searchResults = useMemo(
    () => fuse.search(searchText, { limit: numOfResults }),
    [fuse, searchText, numOfResults]
  );
  return searchResults;
}

// Flatten the content into individual lines
const flattenContent = (content: Descendant[]) => {
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
