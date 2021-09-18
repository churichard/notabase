import { Editor, Point } from 'slate';
import { insertBlockReference } from 'editor/formatting';
import { deleteText } from 'editor/transforms';

export default function handleBlockReference(
  editor: Editor,
  result: RegExpMatchArray,
  endOfMatchPoint: Point,
  onOwnLine: boolean
): boolean {
  const [, startMark, blockId, endMark] = result;

  // Delete markdown and insert block reference
  const length = startMark.length + blockId.length + endMark.length;
  deleteText(editor, endOfMatchPoint.path, endOfMatchPoint.offset, length);

  insertBlockReference(editor, blockId, onOwnLine);

  return true;
}
