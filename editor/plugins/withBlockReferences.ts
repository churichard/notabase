import { Editor } from 'slate';
import { ElementType } from 'types/slate';

const withBlockReferences = (editor: Editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return element.type === ElementType.BlockReference
      ? true
      : isInline(element);
  };

  return editor;
};

export default withBlockReferences;
