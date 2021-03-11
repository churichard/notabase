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

const BLOCK_SHORTCUTS: Record<string, string> = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '1.': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
};

const INLINE_SHORTCUTS: Record<string, string> = {
  '**': 'bold',
  '*': 'italic',
  '`': 'code',
};

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
      const type = BLOCK_SHORTCUTS[beforeText];

      if (type) {
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
            type: beforeText === '1.' ? 'numbered-list' : 'bulleted-list',
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
    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = SlateEditor.above(editor, {
        match: (n) => SlateEditor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = SlateEditor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = SlateEditor.string(editor, range);

      for (const [mark, format] of Object.entries(INLINE_SHORTCUTS)) {
        const lastIndex = beforeText.lastIndexOf(mark);
        const secondToLastIndex = beforeText.lastIndexOf(
          mark,
          lastIndex - mark.length
        );

        // If there aren't two marks, or the two marks are next to each other, then we don't format
        if (
          lastIndex === -1 ||
          secondToLastIndex === -1 ||
          lastIndex - secondToLastIndex <= 1
        ) {
          continue;
        }

        const textToFormat = beforeText.substring(
          secondToLastIndex + mark.length,
          lastIndex
        );
        const selectionPath = anchor.path;
        let endOfSelection = anchor.offset;

        // Delete the ending mark
        const endMarkRange = {
          anchor: { path: selectionPath, offset: endOfSelection - mark.length },
          focus: { path: selectionPath, offset: endOfSelection },
        };
        Transforms.delete(editor, { at: endMarkRange });
        endOfSelection -= mark.length;

        // Delete the start mark
        const startMarkRange = {
          anchor: {
            path: selectionPath,
            offset: endOfSelection - textToFormat.length,
          },
          focus: {
            path: selectionPath,
            offset: endOfSelection - textToFormat.length - mark.length,
          },
        };
        Transforms.delete(editor, { at: startMarkRange });
        endOfSelection -= mark.length;

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
          { [format]: true },
          { at: textToFormatRange, match: (n) => Text.isText(n), split: true }
        );
        SlateEditor.removeMark(editor, format);

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
