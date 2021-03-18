import {
  Node,
  Editor as SlateEditor,
  Element as SlateElement,
  Transforms,
} from 'slate';
import { ReactEditor } from 'slate-react';
import { LIST_TYPES } from 'editor/formatting';

/**
 * When enter is pressed in the middle or at the end of a block,
 * we want to create a paragraph and break out of the current formatting block
 */
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
    const lineEnd = SlateEditor.end(editor, path);
    const lineRange = { anchor: lineStart, focus: lineEnd };
    const lineText = SlateEditor.string(editor, lineRange);

    const isAtLineStart = SlateEditor.isStart(editor, anchor, path);
    const isAtLineEnd = SlateEditor.isEnd(editor, anchor, path);

    const lineElement = Node.descendant(editor, path);
    const lineElementType = lineElement.type as string;
    const insertElementType =
      lineElementType === 'list-item' ? lineElementType : 'paragraph';

    // The element is a list item
    if (lineElementType === 'list-item' && lineText.length === 0) {
      // We only want to insert a paragraph if there is no text content in the current bullet point
      Transforms.setNodes(editor, { type: 'paragraph' });

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !SlateEditor.isEditor(n) &&
          SlateElement.isElement(n) &&
          LIST_TYPES.includes(n.type as string),
        split: true,
      });
    }
    // The cursor is at the end of the line
    else if (isAtLineEnd) {
      // We insert a paragraph after the current node
      Transforms.insertNodes(editor, {
        type: insertElementType,
        children: [{ text: '', marks: [] }],
      });
    }
    // The cursor is at the start of the line
    else if (isAtLineStart) {
      // We insert a paragraph before the current node
      Transforms.insertNodes(editor, {
        type: insertElementType,
        children: [{ text: '', marks: [] }],
      });
      Transforms.move(editor); // Moves the cursor to the next line
    }
    // The cursor is in the middle of the text
    else {
      insertBreak();
    }
  };

  return editor;
};

export default withBlockBreakout;
