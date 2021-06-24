import { Editor, Element, Node, Selection, Text, Transforms } from 'slate';
import { Mark } from 'types/slate';

const withNormalization = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Remove inline elements or text elements with marks if they have no text
    if (Element.isElement(node)) {
      const markArr = Object.values(Mark);

      for (const [child, childPath] of Node.children(editor, path)) {
        if (
          Element.isElement(child) &&
          editor.isInline(child) &&
          !editor.isVoid(child) &&
          !Node.string(child)
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          if (!isAtLineEnd(editor, editor.selection)) {
            // This ensures the selection doesn't move to the previous line
            Transforms.move(editor, { distance: 1, unit: 'offset' });
          }
          return;
        } else if (
          Text.isText(child) &&
          !Node.string(child) &&
          markArr.some((mark) => !!child[mark])
        ) {
          Transforms.unsetNodes(editor, markArr, { at: childPath });
          if (!isAtLineEnd(editor, editor.selection)) {
            // This ensures the selection doesn't move to the previous line
            Transforms.move(editor, { distance: 1, unit: 'offset' });
          }
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

const isAtLineEnd = (editor: Editor, selection: Selection) => {
  if (!selection) {
    return false;
  }

  const { anchor } = selection;
  const block = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });
  const linePath = block ? block[1] : [];

  return Editor.isEnd(editor, anchor, linePath);
};

export default withNormalization;
