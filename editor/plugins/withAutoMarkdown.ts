import {
  Editor as SlateEditor,
  Element as SlateElement,
  Transforms,
  Range,
  Point,
  Text,
} from 'slate';
import { ReactEditor } from 'slate-react';
import { LIST_TYPES } from 'editor/formatting';

const BLOCK_SHORTCUTS = [
  { match: /^(\*|-|\+)$/, type: 'list-item', listType: 'bulleted-list' }, // match *, -, or +
  { match: /^([0-9]+\.)$/, type: 'list-item', listType: 'numbered-list' }, // match numbered lists
  { match: /^>$/, type: 'block-quote' },
  { match: /^#$/, type: 'heading-one' },
  { match: /^##$/, type: 'heading-two' },
  { match: /^###$/, type: 'heading-three' },
];

const INLINE_SHORTCUTS = [
  { match: /(\*\*|__)(.+)(\*\*|__)/, type: 'bold' },
  { match: /(\*|_)(.+)(\*|_)/, type: 'italic' },
  { match: /(`)(.+)(`)/, type: 'code' },
];

// Add auto-markdown formatting shortcuts
const withAutoMarkdown = (editor: ReactEditor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    // Handle shortcuts at the beginning of a line
    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = SlateEditor.above(editor, {
        match: (n) => SlateEditor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = SlateEditor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = SlateEditor.string(editor, range);

      // Handle block shortcuts
      for (const shortcut of BLOCK_SHORTCUTS) {
        if (beforeText.match(shortcut.match)) {
          const type = shortcut.type;

          Transforms.select(editor, range);
          Transforms.delete(editor);
          const newProperties: Partial<SlateElement> = {
            type,
          };
          Transforms.setNodes(editor, newProperties, {
            match: (n) => SlateEditor.isBlock(editor, n),
          });

          if (type === 'list-item') {
            const list = {
              type: shortcut.listType,
              children: [],
            };
            Transforms.wrapNodes(editor, list, {
              match: (n) =>
                !SlateEditor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'list-item',
            });
          }
          return;
        }
      }

      // Handle inline shortcuts
      for (const { match, type } of INLINE_SHORTCUTS) {
        const result = beforeText.match(match);

        if (!result) {
          continue;
        }

        if (type === 'bold' || type === 'italic' || type === 'code') {
          const [, startMark, textToFormat, endMark] = result;

          const selectionPath = anchor.path;
          let endOfSelection = anchor.offset;

          // Delete the ending mark
          const endMarkRange = {
            anchor: {
              path: selectionPath,
              offset: endOfSelection - endMark.length,
            },
            focus: { path: selectionPath, offset: endOfSelection },
          };
          Transforms.delete(editor, { at: endMarkRange });
          endOfSelection -= endMark.length;

          // Delete the start mark
          const startMarkRange = {
            anchor: {
              path: selectionPath,
              offset: endOfSelection - textToFormat.length,
            },
            focus: {
              path: selectionPath,
              offset: endOfSelection - textToFormat.length - startMark.length,
            },
          };
          Transforms.delete(editor, { at: startMarkRange });
          endOfSelection -= startMark.length;

          // Add formatting mark to the text to format
          const textToFormatRange = {
            anchor: {
              path: selectionPath,
              offset: endOfSelection,
            },
            focus: {
              path: selectionPath,
              offset: endOfSelection - textToFormat.length,
            },
          };
          Transforms.setNodes(
            editor,
            { [type]: true },
            { at: textToFormatRange, match: (n) => Text.isText(n), split: true }
          );
          SlateEditor.removeMark(editor, type);
        }

        // Insert the space at the end
        insertText(text);
        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = SlateEditor.above(editor, {
        match: (n) => SlateEditor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = SlateEditor.start(editor, path);

        if (
          !SlateEditor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph',
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !SlateEditor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type as string),
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

export default withAutoMarkdown;
