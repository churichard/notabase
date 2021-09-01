import { Descendant } from 'slate';
import { ElementType } from 'types/slate';
import { createNodeId } from './plugins/withNodeId';

export const DEFAULT_EDITOR_VALUE: Descendant[] = [
  { id: createNodeId(), type: ElementType.Paragraph, children: [{ text: '' }] },
];
