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

import { ElementType, Mark } from 'types/slate';
import { MdastNode } from './types';

export interface OptionType {
  imageSourceKey?: string;
  imageCaptionKey?: string;
}

export default function deserialize(node: MdastNode, opts?: OptionType) {
  // const imageSourceKey = opts?.imageSourceKey ?? 'link';
  // const imageCaptionKey = opts?.imageCaptionKey ?? 'caption';

  let children = [{ text: '' }];

  if (
    node.children &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    children = node.children.map((c: MdastNode) =>
      deserialize(
        {
          ...c,
          ordered: node.ordered || false,
          parentType: node.type,
        },
        opts
      )
    );
  }

  switch (node.type) {
    case 'heading':
      if (node.depth === 1) {
        return { type: ElementType.HeadingOne, children };
      } else if (node.depth === 2) {
        return { type: ElementType.HeadingTwo, children };
      } else {
        return { type: ElementType.HeadingThree, children };
      }
    case 'list':
      return {
        type: node.ordered
          ? ElementType.NumberedList
          : ElementType.BulletedList,
        children,
      };
    case 'listItem':
      return { type: ElementType.ListItem, children };
    case 'paragraph':
      return { type: ElementType.Paragraph, children };
    case 'link':
      return { type: ElementType.ExternalLink, url: node.url, children };
    // case 'image':
    //   return {
    //     type: types.image,
    //     children: [{ text: '' }],
    //     [imageSourceKey]: node.url,
    //     [imageCaptionKey]: node.alt,
    //   };
    case 'blockquote':
      return { type: ElementType.Blockquote, children };
    case 'code':
      return {
        type: ElementType.CodeBlock,
        // language: node.lang,
        children: [{ text: node.value }],
      };

    case 'html':
      return { text: node.value?.replace(/<br>|<br\/>/g, '\n') || '' };

    case 'emphasis':
      return {
        [Mark.Italic]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case 'strong':
      return {
        [Mark.Bold]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case 'delete':
      return {
        [Mark.Strikethrough]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case 'inlineCode':
      return {
        [Mark.Code]: true,
        text: node.value,
        ...persistLeafFormats(children),
      };
    case 'thematicBreak':
      return {
        type: ElementType.ThematicBreak,
        children: [{ text: '' }],
      };

    case 'text':
    default:
      return { text: node.value || '' };
  }
}

const forceLeafNode = (children: Array<{ text?: string }>) => ({
  text: children.map((k) => k?.text).join(''),
});

// This function is will take any unknown keys, and bring them up a level
// allowing leaf nodes to have many different formats at once
// for example, bold and italic on the same node
function persistLeafFormats(children: Array<MdastNode>) {
  return children.reduce((acc, node) => {
    Object.keys(node).forEach(function (key) {
      if (key === 'children' || key === 'type' || key === 'text') return;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      acc[key] = node[key];
    });

    return acc;
  }, {});
}
