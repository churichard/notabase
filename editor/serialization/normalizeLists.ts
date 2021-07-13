import { MdastNode } from './types';

/**
 * This plugin normalizes lists to conform to Notabase's slate schema.
 * It flattens nested lists and normalizes paragraphs to text nodes.
 */
export default function normalizeLists(node: MdastNode): MdastNode {
  if (node.type !== 'list' || !node.children) {
    return node;
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

    const nestedLists = [];
    const newNestedChildren = [];

    // Iterate through the children of the list item
    for (const nestedChild of normalizedChild.children) {
      const convertedNestedChild = normalizeLists(nestedChild); // Normalize list item child

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
}
