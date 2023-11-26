import { Editor, Element, Transforms } from 'slate';
import { isListType } from 'editor/formatting';
import { ElementType } from 'types/slate';

const withCustomDeleteBackward = (editor: Editor) => {
  const { deleteBackward } = editor;

  // Convert list item to a paragraph if deleted at the beginning of the item
  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    const block = Editor.above(editor, {
      match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!selection || !block) {
      deleteBackward(...args);
      return;
    }

    const [lineElement, path] = block;
    const isAtLineStart = Editor.isStart(editor, selection.anchor, path);

    // The selection is at the start of the line
    if (
      isAtLineStart &&
      Element.isElement(lineElement) &&
      lineElement.type !== ElementType.Paragraph &&
      lineElement.type !== ElementType.BlockReference
    ) {
      // If it is a list item, unwrap the list
      if (lineElement.type === ElementType.ListItem) {
        Transforms.unwrapNodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
          split: true,
        });

        const isInList = Editor.above(editor, {
          match: (n) =>
            !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
        });
        if (!isInList) {
          Transforms.setNodes(editor, { type: ElementType.Paragraph });
        }
      } else {
        // Convert to paragraph
        Transforms.setNodes(editor, { type: ElementType.Paragraph });
      }

      return;
    }

    deleteBackward(...args);
  };

  return editor;
};

export default withCustomDeleteBackward;
