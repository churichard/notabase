import { Editor } from 'slate';
import { ElementType } from 'types/slate';

const withThematicBreak = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === ElementType.ThematicBreak ? true : isVoid(element);
  };

  return editor;
};

export default withThematicBreak;
