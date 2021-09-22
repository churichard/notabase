import { Editor, Point, Text, Transforms } from 'slate';
import { Mark } from 'types/slate';
import { deleteMarkup } from './handleInlineShortcuts';

export default function handleMark(
  editor: Editor,
  type: Mark,
  result: RegExpMatchArray,
  endOfMatchPoint: Point,
  textToInsertLength: number
): boolean {
  const [, startMark, textToFormat, endMark] = result;

  const textRange = deleteMarkup(editor, endOfMatchPoint, {
    startMark: startMark.length,
    text: textToFormat.length,
    endMark: endMark.length,
    textToInsert: textToInsertLength,
  });

  // Add formatting mark to the text to format
  Transforms.setNodes(
    editor,
    { [type]: true },
    { at: textRange, match: (n) => Text.isText(n), split: true }
  );
  Editor.removeMark(editor, type);

  return true;
}
