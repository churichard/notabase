import { Editor, Element, Transforms } from 'slate';
import { isListType } from 'editor/formatting';
import { ElementType } from 'types/slate';

const withDeleteBackwardWorkaround = (editor: Editor) => {
  const { deleteBackward } = editor;

  // Workaround from https://github.com/ianstormtaylor/slate/issues/3408
  // Basically, prevents a list item on the previous line from getting converted into a paragraph
  // and being nested in a bulleted/numbered list.
  editor.deleteBackward = (...args) => {
    deleteBackward(...args);

    const match = Editor.above(editor, {
      match: (n) => Element.isElement(n) && isListType(n.type),
    });

    if (match) {
      Transforms.setNodes(editor, { type: ElementType.ListItem });
    }
  };

  return editor;
};

export default withDeleteBackwardWorkaround;
