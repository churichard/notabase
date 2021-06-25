import { Editor, Element, Node, Transforms } from 'slate';
import { isListType } from 'editor/formatting';
import { ElementType } from 'types/slate';

const withCustomDeleteBackward = (editor: Editor) => {
  const { deleteBackward } = editor;

  // Convert list item to a paragraph if deleted at the beginning of the item
  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (!selection) {
      deleteBackward(...args);
      return;
    }

    const { anchor } = selection;
    const block = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });
    const path = block ? block[1] : [];

    const isAtLineStart = Editor.isStart(editor, anchor, path);

    const lineElement = Node.descendant(editor, path);

    if (!Element.isElement(lineElement)) {
      deleteBackward(...args);
      return;
    }
    const lineElementType = lineElement.type;

    // The element is a list item and the selection is at the start of the line
    if (lineElementType === ElementType.ListItem && isAtLineStart) {
      // Convert to paragraph
      Transforms.setNodes(editor, { type: ElementType.Paragraph });

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
        split: true,
      });

      return;
    }

    deleteBackward(...args);
  };

  return editor;
};

export default withCustomDeleteBackward;
