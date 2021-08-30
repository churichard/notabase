import { MdastNode } from './types';

/**
 * This plugin normalizes the MdastNode format to conform to Notabase's slate schema.
 */
export default function normalize(node: MdastNode): MdastNode {
  return normalizeImages(normalizeLists(node));
}

/**
 * This function:
 * 1. Lifts nested lists up one level
 * 2. Strips out paragraphs from list items, lifting the list item children up one level
 */
const normalizeLists = (node: MdastNode): MdastNode => {
  if (!node.children) {
    return node;
  }

  if (node.type !== 'list') {
    return { ...node, children: node.children.map(normalizeLists) };
  }

  const newChildren = [];

  // Iterate through the children (list items) of the list
  for (const child of node.children) {
    const normalizedChild = normalizeLists(child); // Normalize child

    if (!normalizedChild.children) {
      // No children, just push in normally
      newChildren.push(normalizedChild);
      continue;
    }

    // Iterate through the children of the list item
    if (child.type === 'listItem') {
      const nestedLists = [];
      const newNestedChildren = [];
      for (const nestedChild of normalizedChild.children) {
        if (!nestedChild.children) {
          // No children, just push in normally
          newNestedChildren.push(nestedChild);
          continue;
        }

        if (nestedChild.type === 'list') {
          // If the list item child is a list, add it to nestedLists
          nestedLists.push(nestedChild);
        } else if (
          nestedChild.type === 'paragraph' ||
          nestedChild.type === 'heading'
        ) {
          // If the list item child is a paragraph or heading, remove the wrapper
          newNestedChildren.push(...(nestedChild.children ?? []));
        } else {
          // If the list item child is anything else (e.g. list item), add it normally
          newNestedChildren.push(nestedChild);
        }
      }

      // Add in the normalized list item with its normalized children, as well as the nested lists
      newChildren.push({ ...normalizedChild, children: newNestedChildren });
      newChildren.push(...nestedLists);
    } else {
      // Push in normally if it is not a list item
      newChildren.push(normalizedChild);
    }
  }

  return { ...node, children: newChildren };
};

/**
 * This function splits images into their own block if necessary (splitting the parent node)
 */
const normalizeImages = (node: MdastNode): MdastNode => {
  if (!node.children) {
    return node;
  }

  const newChildren = [];

  for (const child of node.children) {
    const normalizedChild = normalizeImages(child); // Normalize child

    // Pull the image out into its own block if it's not the child of a list
    if (
      normalizedChild.type !== 'list' &&
      normalizedChild.children?.some(
        (nestedChild) => nestedChild.type === 'image'
      )
    ) {
      const blocks: MdastNode[] = [];

      // Split children into separate blocks
      for (const nestedChild of normalizedChild.children) {
        if (nestedChild.type === 'image') {
          blocks.push(nestedChild);
        }
        // Nested child is a text node
        else {
          // Add a new block if it doesn't exist yet
          if (
            blocks.length <= 0 ||
            blocks[blocks.length - 1].type === 'image'
          ) {
            blocks.push({ type: normalizedChild.type, children: [] });
          }
          blocks[blocks.length - 1].children?.push(nestedChild);
        }
      }

      newChildren.push(...blocks);
    } else {
      newChildren.push(normalizedChild);
    }
  }

  return { ...node, children: newChildren };
};
