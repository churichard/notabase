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

      const nestedLists = [];
      const newNestedChildren = [];

      // Iterate through the children of the list item
      for (const nestedChild of normalizedChild.children) {
        const convertedNestedChild = normalize(nestedChild); // Normalize list item child

        if (!convertedNestedChild.children) {
          // No children, just push in normally
          newNestedChildren.push(convertedNestedChild);
          continue;
        }

        if (convertedNestedChild.type === 'list') {
          // If the list item child is a list, add it to nestedLists
          nestedLists.push(convertedNestedChild);
        } else {
          // If the list item child is not a list (i.e. a paragraph), remove the paragraph wrapper
          newNestedChildren.push(...(convertedNestedChild.children ?? []));
        }
      }

      // Add in the normalized list item with its normalized children, as well as the nested lists
      newChildren.push({ ...normalizedChild, children: newNestedChildren });
      newChildren.push(...nestedLists);
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
          const convertedNestedChild = normalize(nestedChild); // Normalize list item child

          if (convertedNestedChild.type === 'text') {
            // Convert text node into paragraph
            newChildren.push({
              type: 'paragraph',
              children: [convertedNestedChild],
            });
          } else {
            newChildren.push(convertedNestedChild);
          }
        }
      } else {
        newChildren.push(normalizedChild);
      }
    }

    return { ...node, children: newChildren };
  }
}
