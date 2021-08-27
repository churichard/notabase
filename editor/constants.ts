import { Descendant } from 'slate';
import { ElementType } from 'types/slate';

export const DEFAULT_EDITOR_VALUE: Descendant[] = [
  { type: ElementType.Paragraph, children: [{ text: '' }] },
];
