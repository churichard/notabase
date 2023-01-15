import { Editor, Element } from 'slate';
import { isReferenceableBlockElement } from 'editor/checks';
import deleteBlockBacklinks from 'editor/backlinks/deleteBlockBacklinks';
import { isPartialElement } from './withNodeId';

const withBlockReferences = (editor: Editor) => {
  const { apply } = editor;

  // Remove block references if the original block is deleted
  editor.apply = (operation) => {
    apply(operation);

    if (operation.type === 'merge_node') {
      const node = operation.properties;

      if (isPartialElement(node) && node.id) {
        deleteBlockBacklinks(editor, node.id);
      }
    }

    if (operation.type === 'remove_node') {
      const node = operation.node;

      if (
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        isReferenceableBlockElement(node) &&
        node.id
      ) {
        deleteBlockBacklinks(editor, node.id);
      }
    }
  };

  return editor;
};

export default withBlockReferences;
