import { Editor, Point, Transforms } from 'slate';
import { ElementType, ExternalLink } from 'types/slate';
import { isUrl } from 'utils/url';
import { createNodeId } from '../withNodeId';
import { deleteMarkup } from './handleInlineShortcuts';

export default function handleExternalLink(
  editor: Editor,
  result: RegExpMatchArray,
  endOfMatchPoint: Point
): boolean {
  const [, startMark, linkText, middleMark, linkUrl, endMark] = result;

  if (!isUrl(linkUrl)) {
    return false;
  }

  const linkTextRange = deleteMarkup(editor, endOfMatchPoint, {
    startMark: startMark.length,
    text: linkText.length,
    endMark: middleMark.length + linkUrl.length + endMark.length,
  });
  const link: ExternalLink = {
    id: createNodeId(),
    type: ElementType.ExternalLink,
    url: linkUrl,
    children: [],
  };
  Transforms.wrapNodes(editor, link, {
    at: linkTextRange,
    split: true,
  });

  return true;
}
