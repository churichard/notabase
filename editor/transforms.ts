import { Editor, Location, Node, Path, Point, Transforms } from 'slate';

// Deletes `length` characters at the specified path and offset
export const deleteText = (
  editor: Editor,
  path: Path,
  offset: number,
  length: number
) => {
  const anchorOffset = offset - length;
  if (anchorOffset === offset) {
    return; // Don't delete anything if the two offsets are the same
  }
  const range = {
    anchor: { path, offset: anchorOffset },
    focus: { path, offset },
  };
  Transforms.delete(editor, { at: range });
};

/**
 * resetNodes resets the value of the editor.
 * It should be noted that passing the `at` parameter may cause a "Cannot resolve a DOM point from Slate point" error.
 */
export const resetNodes = (
  editor: Editor,
  options: {
    nodes?: Node | Node[];
    at?: Location;
  } = {}
): void => {
  const children = [...editor.children];

  children.forEach((node) =>
    editor.apply({ type: 'remove_node', path: [0], node })
  );

  if (options.nodes) {
    const nodes = Node.isNode(options.nodes) ? [options.nodes] : options.nodes;

    nodes.forEach((node, i) =>
      editor.apply({ type: 'insert_node', path: [i], node: node })
    );
  }

  const point =
    options.at && Point.isPoint(options.at)
      ? options.at
      : Editor.end(editor, []);

  if (point) {
    try {
      Transforms.select(editor, point);
    } catch (e) {
      // Do nothing. Selection was not able to be restored.
    }
  }
};
