import {
  Node,
  Editor as SlateEditor,
  Element as SlateElement,
  Transforms,
} from 'slate';
import { ReactEditor } from 'slate-react';
import { LIST_TYPES } from 'editor/formatting';

const BREAKOUT_ELEMENTS = [
  'heading-one',
  'heading-two',
  'heading-three',
  'block-quote',
  'list-item',
];

// When enter is pressed in the middle or at the end of a block,
// we want to create a paragraph and break out of the current formatting block
const withBlockBreakout = (editor: ReactEditor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;

    if (!selection) {
      insertBreak();
      return;
    }

    const { anchor } = selection;
    const block = SlateEditor.above(editor, {
      match: (n) => SlateEditor.isBlock(editor, n),
    });
    const path = block ? block[1] : [];
    const lineStart = SlateEditor.start(editor, path);
    const lineRange = { anchor, focus: lineStart };
    const lineElement = Node.descendant(editor, path);
    const lineElementType = lineElement.type as string;
    const lineText = SlateEditor.string(editor, lineRange);

    if (!BREAKOUT_ELEMENTS.includes(lineElementType)) {
      insertBreak();
      return;
    }

    const selectedLeaf = Node.descendant(editor, anchor.path);
    const selectedLeafText = selectedLeaf.text as string;

    // The element is a list item
    if (lineElementType === 'list-item') {
      // Insert a regular break if there is text content in the current bullet point
      if (lineText.length > 0) {
        insertBreak();
        return;
      }

      // We only want to insert a paragraph if there is no text content in the current bullet point
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
    else if (anchor.offset === selectedLeafText.length) {
      // We insert a paragraph after the current node
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '', marks: [] }],
      });
    }
    // The cursor is at the beginning of the text
    else if (anchor.offset === 0) {
      // We insert a paragraph before the current node
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '', marks: [] }],
      });
      Transforms.move(editor);
    }
    // The cursor is in the middle of the text
    else {
      // We insert a paragraph with the proper text
      Transforms.splitNodes(editor);
      Transforms.setNodes(editor, { type: 'paragraph' });
    }
  };

  return editor;
};

export default withBlockBreakout;
