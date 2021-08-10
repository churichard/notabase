import { Element } from 'slate';
import { BlockElementWithId, ElementType } from 'types/slate';

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
    element.type === ElementType.ThematicBreak
  );
};
