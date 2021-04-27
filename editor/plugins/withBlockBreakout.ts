import {
  Node,
  Editor,
  Element,
  Transforms,
  Range,
  Text,
  Path,
  Point,
} from 'slate';
import { isListType } from 'editor/formatting';
import { ElementType } from 'types/slate';

/**
 * When enter is pressed in the middle or at the end of a block,
 * we want to create a paragraph and break out of the current formatting block
 */
const withBlockBreakout = (editor: Editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;

    if (!selection) {
      insertBreak();
      return;
    }

    const { anchor } = selection;
    const block = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });
    const path = block ? block[1] : [];

    const lineStart = Editor.start(editor, path);
    const lineEnd = Editor.end(editor, path);
    const lineRange = { anchor: lineStart, focus: lineEnd };
    const lineText = Editor.string(editor, lineRange);

    const isAtLineStart = Editor.isStart(editor, anchor, path);
    const isAtLineEnd = Editor.isEnd(editor, anchor, path);

    const lineElement = Node.descendant(editor, path);

    if (!Element.isElement(lineElement)) {
      insertBreak();
      return;
    }

    const lineElementType = lineElement.type;
    const insertElementType =
      lineElementType === ElementType.ListItem
        ? lineElementType
        : ElementType.Paragraph;

    // The element is a list item
    if (lineElementType === ElementType.ListItem && lineText.length === 0) {
      // We only want to insert a paragraph if there is no text content in the current bullet point
      Transforms.setNodes(editor, { type: ElementType.Paragraph });

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
        split: true,
      });
    }
    // The cursor is at the end of the line
    else if (isAtLineEnd) {
      // We insert after the current node
      Transforms.insertNodes(editor, {
        type: insertElementType,
        children: [{ text: '' }],
      });
    }
    // The cursor is at the start of the line
    else if (isAtLineStart) {
      // We insert before the current node
      Transforms.insertNodes(editor, {
        type: insertElementType,
        children: [{ text: '' }],
      });
      Transforms.move(editor); // Moves the cursor to the next line
    }
    // The cursor is in the middle of the text
    else {
      // Don't create empty inline nodes
      const [ancestorNode, path] = Editor.parent(editor, selection);
      if (Element.isElement(ancestorNode) && editor.isInline(ancestorNode)) {
        const endPoint = Range.end(selection);
        const [selectedLeaf] = Editor.node(editor, endPoint);
        if (
          Text.isText(selectedLeaf) &&
          selectedLeaf.text.length === endPoint.offset
        ) {
          if (Range.isExpanded(selection)) {
            Transforms.delete(editor);
          }
          const point: Point = { path: Path.next(path), offset: 0 };
          const newSelection: Range = { anchor: point, focus: point };
          Transforms.select(editor, newSelection);
        }
      }
      insertBreak();
    }
  };

  return editor;
};

export default withBlockBreakout;
