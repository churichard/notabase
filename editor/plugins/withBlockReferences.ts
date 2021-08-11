import { Editor, Element } from 'slate';
import {
  Blockquote,
  CodeBlock,
  ElementType,
  HeadingOneElement,
  HeadingTwoElement,
  HeadingThreeElement,
  Image,
  ListItem,
  ParagraphElement,
  ThematicBreak,
} from 'types/slate';

export type BlockElementWithId =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | ListItem
  | Blockquote
  | CodeBlock
  | ThematicBreak
  | Image;

// Only block elements that are not bulleted/numbered lists can be block references + have block ids
export const isElementWithBlockId = (
  element: Element
): element is BlockElementWithId => {
  return (
    element.type === ElementType.Paragraph ||
    element.type === ElementType.HeadingOne ||
    element.type === ElementType.HeadingTwo ||
    element.type === ElementType.HeadingThree ||
    element.type === ElementType.ListItem ||
    element.type === ElementType.Blockquote ||
    element.type === ElementType.CodeBlock ||
    element.type === ElementType.ThematicBreak ||
    element.type === ElementType.Image
  );
};

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
