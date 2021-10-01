/*
The following was modified from the source code of remark-slate.

License (MIT)
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
Copyright © 2020-present Jack Hanford, jackhanford@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Element, Text } from 'slate';
import {
  BlockReference,
  CheckListItem,
  ElementType,
  ExternalLink,
  FormattedText,
  Image,
  NoteLink,
  Tag,
} from 'types/slate';
import { isVoid } from 'editor/plugins/withVoidElements';
import { computeBlockReference } from 'editor/backlinks/useBlockReference';
import { store } from 'lib/store';
import { isListType } from 'editor/formatting';

type LeafType = FormattedText & { parentType?: ElementType };

type BlockType = Element & { parentType?: ElementType };

type Options = {
  listDepth?: number;
};

const isLeafNode = (node: BlockType | LeafType): node is LeafType => {
  return Text.isText(node);
};

const BREAK_TAG = '';

export default function serialize(
  chunk: BlockType | LeafType,
  opts: Options = {}
): string | undefined {
  const { listDepth = 0 } = opts;
  const text: string = (chunk as LeafType).text || '';
  const type: ElementType = (chunk as BlockType).type || '';

  let children = text;

  if (!isLeafNode(chunk)) {
    children = chunk.children
      .map((c: BlockType | LeafType) => {
        return serialize(
          { ...c, parentType: type },
          {
            // track depth of nested lists so we can add proper spacing
            listDepth: isListType((c as BlockType).type || '')
              ? listDepth + 1
              : listDepth,
          }
        );
      })
      .join('');
  }

  // Keep empty paragraphs and void elements, but strip out other empty elements
  if (
    children === '' &&
    type !== ElementType.Paragraph &&
    !isLeafNode(chunk) &&
    !isVoid(chunk)
  ) {
    return;
  }

  // Never allow decorating break tags with rich text formatting,
  // this can malform generated markdown
  // Also ensure we're only ever applying text formatting to leaf node
  // level chunks, otherwise we can end up in a situation where
  // we try applying formatting like to a node like this:
  // "Text foo bar **baz**" resulting in "**Text foo bar **baz****"
  // which is invalid markup and can mess everything up
  if (children !== BREAK_TAG && isLeafNode(chunk)) {
    if (chunk.strikethrough && chunk.bold && chunk.italic) {
      children = retainWhitespaceAndFormat(children, '~~***');
    } else if (chunk.bold && chunk.italic) {
      children = retainWhitespaceAndFormat(children, '***');
    } else {
      if (chunk.bold) {
        children = retainWhitespaceAndFormat(children, '**');
      }

      if (chunk.italic) {
        children = retainWhitespaceAndFormat(children, '_');
      }

      if (chunk.strikethrough) {
        children = retainWhitespaceAndFormat(children, '~~');
      }

      if (chunk.code) {
        children = retainWhitespaceAndFormat(children, '`');
      }

      if (chunk.underline) {
        children = retainWhitespaceAndFormat(children, '<u>');
      }
    }
  }

  switch (type) {
    case ElementType.HeadingOne:
      return `# ${children}\n`;
    case ElementType.HeadingTwo:
      return `## ${children}\n`;
    case ElementType.HeadingThree:
      return `### ${children}\n`;

    case ElementType.Blockquote:
      // For some reason, marked is parsing blockquotes w/ one new line
      // as contiued blockquotes, so adding two new lines ensures that doesn't
      // happen
      return `> ${children}\n\n`;

    case ElementType.CodeBlock:
      return `\`\`\`\n${children}\n\`\`\`\n`;

    case ElementType.NoteLink: {
      const noteLink = chunk as NoteLink;
      if (!noteLink.noteTitle) {
        return '';
      } else {
        return noteLink.customText
          ? `[[${noteLink.noteTitle}|${noteLink.customText}]]`
          : `[[${noteLink.noteTitle}]]`;
      }
    }
    case ElementType.ExternalLink:
      return `[${children}](${(chunk as ExternalLink).url})`;
    case ElementType.Tag:
      return `#${(chunk as Tag).name}`;

    case ElementType.Image: {
      const image = chunk as Image;
      return `![${image.caption ?? image.url}](${image.url})\n\n`;
    }

    case ElementType.BulletedList:
    case ElementType.NumberedList: {
      const newLine =
        chunk.parentType && isListType(chunk.parentType) ? '' : '\n';
      return `${children}${newLine}`;
    }

    case ElementType.ListItem: {
      const isNumberedList =
        chunk && chunk.parentType === ElementType.NumberedList;

      let spacer = '';
      for (let k = 0; listDepth > k; k++) {
        spacer += '   ';
      }
      return `${spacer}${isNumberedList ? '1.' : '-'} ${children}\n`;
    }

    case ElementType.CheckListItem: {
      const checklistItem = chunk as CheckListItem;
      const check = checklistItem.checked ? 'x' : ' ';
      return `- [${check}] ${children}\n\n`;
    }

    case ElementType.Paragraph:
      return `${children}\n\n`;

    case ElementType.ThematicBreak:
      return `---\n\n`;

    case ElementType.BlockReference: {
      const blockRef = chunk as BlockReference;
      const reference = computeBlockReference(
        store.getState().notes,
        blockRef.blockId
      );
      if (reference) {
        return serialize(reference.element);
      } else {
        return children;
      }
    }

    default:
      return children;
  }
}

// This function handles the case of a string like this: "   foo   "
// Where it would be invalid markdown to generate this: "**   foo   **"
// We instead, want to trim the whitespace out, apply formatting, and then
// bring the whitespace back. So our returned string looks like this: "   **foo**   "
function retainWhitespaceAndFormat(string: string, format: string) {
  // we keep this for a comparison later
  const frozenString = string.trim();

  // children will be mutated
  const children = frozenString;

  // We reverse the right side formatting, to properly handle bold/italic and strikethrough
  // formats, so we can create ~~***FooBar***~~
  const fullFormat = `${format}${children}${getEndFormat(format)}`;

  // This conditions accounts for no whitespace in our string
  // if we don't have any, we can return early.
  if (children.length === string.length) {
    return fullFormat;
  }

  // if we do have whitespace, let's add our formatting around our trimmed string
  // We reverse the right side formatting, to properly handle bold/italic and strikethrough
  // formats, so we can create ~~***FooBar***~~
  const formattedString = format + children + getEndFormat(format);

  // and replace the non-whitespace content of the string
  return string.replace(frozenString, formattedString);
}

const getEndFormat = (format: string) => {
  if (format === '<u>') {
    return '</u>';
  } else {
    return format.split('').reverse().join('');
  }
};
