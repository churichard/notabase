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
    // The cursor is at the beginning of the text
    else if (selection.anchor.offset === 0) {
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
