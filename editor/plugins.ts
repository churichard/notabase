import {
  Node,
  Editor as SlateEditor,
  Element as SlateElement,
  Transforms,
  Range,
  Point,
} from 'slate';
import { ReactEditor } from 'slate-react';
import { LIST_TYPES } from './formatting';

const SHORTCUTS: Record<string, string | undefined> = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
};

// Add markdown formatting shortcuts
export const withMarkdownShortcuts = (editor: ReactEditor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = SlateEditor.above(editor, {
        match: (n) => SlateEditor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = SlateEditor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = SlateEditor.string(editor, range);
      const type = SHORTCUTS[beforeText];

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
          const list = { type: 'bulleted-list', children: [] };
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

const BREAKOUT_ELEMENTS = [
  'heading-one',
  'heading-two',
  'heading-three',
  'heading-four',
  'heading-five',
  'heading-six',
  'block-quote',
  'list-item',
];

// When enter is pressed in the middle or at the end of a block,
// we want to create a paragraph and break out of the current formatting block
export const withBlockBreakout = (editor: ReactEditor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;

    if (!selection) {
      insertBreak();
      return;
    }

    const selectedElement = Node.descendant(
      editor,
      selection.anchor.path.slice(0, -1)
    );
    const selectedElementType = selectedElement.type as string;

    if (!BREAKOUT_ELEMENTS.includes(selectedElementType)) {
      insertBreak();
      return;
    }

    const selectedLeaf = Node.descendant(editor, selection.anchor.path);
    const selectedLeafText = selectedLeaf.text as string;

    // The element is a list item
    if (selectedElementType === 'list-item') {
      // We only want to insert a paragraph if there is no text content in the current bullet point
      if (selectedLeafText.length !== 0) {
        insertBreak();
        return;
      }

      const newProperties: Partial<SlateElement> = {
        type: 'paragraph',
      };
      Transforms.setNodes(editor, newProperties);

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !SlateEditor.isEditor(n) &&
          SlateElement.isElement(n) &&
          LIST_TYPES.includes(n.type as string),
        split: true,
      });
    }
    // The cursor is at the end of the text
    else if (selection.anchor.offset === selectedLeafText.length) {
      // We insert a paragraph after the current node
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '', marks: [] }],
      });
    }
    // The cursor is in the middle of the text
    else if (selection.anchor.offset !== 0) {
      // We insert a paragraph with the proper text
      Transforms.splitNodes(editor);
      Transforms.setNodes(editor, { type: 'paragraph' });
    }
    // Preserve normal behavior for the cursor at the beginning of the text
    else {
      insertBreak();
    }
  };

  return editor;
};
