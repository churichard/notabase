import { Element } from 'slate';
import { ReferenceableBlockElement, ElementType } from 'types/slate';

// Returns true if the element is of type ReferenceableBlockElement, false otherwise
export const isReferenceableBlockElement = (
  element: Element
): element is ReferenceableBlockElement => {
  return (
    element.type === ElementType.Paragraph ||
    element.type === ElementType.HeadingOne ||
    element.type === ElementType.HeadingTwo ||
    element.type === ElementType.HeadingThree ||
    element.type === ElementType.ListItem ||
    element.type === ElementType.Blockquote ||
    element.type === ElementType.CodeBlock ||
    element.type === ElementType.ThematicBreak ||
    element.type === ElementType.Image ||
    element.type === ElementType.BlockReference
  );
};
