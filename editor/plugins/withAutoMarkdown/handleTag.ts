import { Editor, Point, Transforms } from 'slate';
import { ElementType, Tag } from 'types/slate';
import { createNodeId } from '../withNodeId';
import { deleteMarkup } from './handleInlineShortcuts';

export default function handleTag(
  editor: Editor,
  result: RegExpMatchArray,
  endOfMatchPoint: Point,
  textToInsertLength: number
): boolean {
  const [, tagName, endMark] = result;

  // Convert the tag name to a tag
  const tagRange = deleteMarkup(editor, endOfMatchPoint, {
    startMark: 0,
    text: tagName.length,
    endMark: endMark.length,
    textToInsert: textToInsertLength,
  });

  const tag: Tag = {
    id: createNodeId(),
    type: ElementType.Tag,
    name: tagName.substring(1), // Remove the leading #
    children: [],
  };

  Transforms.wrapNodes(editor, tag, { at: tagRange, split: true });
  Transforms.move(editor, { unit: 'offset' });
  Transforms.insertText(editor, ' '); // We insert the trigger character (a space)

  return true;
}
