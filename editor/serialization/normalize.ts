import { MdastNode } from './types';

/**
 * This plugin normalizes the MdastNode format to conform to Notabase's slate schema by doing the following:
 * 1. Flattens nested lists
 * 2. Changes paragraphs in list items to text nodes.
 * 3. Turns images into block elements.
 */
export default function normalize(node: MdastNode): MdastNode {
  if (!node.children) {
    return node;
  }

  if (node.type === 'list') {
    const newChildren = [];

    // Iterate through the children (list items) of the list
    for (const child of node.children) {
      const normalizedChild = normalize(child); // Normalize child

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
          } else if (nestedChild.type === 'paragraph') {
            // If the list item child is a paragraph, remove the paragraph wrapper
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
        // Push in normally if it is not a list item (already normalized)
        newChildren.push(normalizedChild);
      }
    }

    return { ...node, children: newChildren };
  } else {
    const newChildren = [];

    for (const child of node.children) {
      const normalizedChild = normalize(child); // Normalize child

      // If the child is a paragraph and it contains an image, we want to pull the image out into its own block
      if (
        normalizedChild.type === 'paragraph' &&
        normalizedChild.children?.some(
          (nestedChild) => nestedChild.type === 'image'
        )
      ) {
        for (const nestedChild of normalizedChild.children) {
          if (nestedChild.type === 'text') {
            // Convert text node into paragraph
            newChildren.push({
              type: 'paragraph',
              children: [nestedChild],
            });
          } else {
            newChildren.push(nestedChild);
          }
        }
      } else {
        newChildren.push(normalizedChild);
      }
    }

    return { ...node, children: newChildren };
  }
}
