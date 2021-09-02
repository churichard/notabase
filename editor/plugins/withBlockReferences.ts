import { createEditor, Editor, Element, Transforms } from 'slate';
import { BlockReference, ElementType } from 'types/slate';
import { computeBlockBacklinks } from 'editor/backlinks/useBlockBacklinks';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { isReferenceableBlockElement } from 'editor/checks';
import { Note } from 'types/supabase';
import { isPartialElement } from './withNodeId';

const replaceBlockRefs = async (editor: Editor, blockId: string) => {
  const notes = store.getState().notes;
  const backlinks = computeBlockBacklinks(notes)[blockId] ?? [];

  // Update the block refs in the current editor to be paragraphs
  const updatedNodes = [];
  const matchingNodes = Editor.nodes<BlockReference>(editor, {
    at: [],
    match: (n) =>
      Element.isElement(n) &&
      n.type === ElementType.BlockReference &&
      n.blockId === blockId,
  });
  for (const [node, path] of matchingNodes) {
    Transforms.setNodes(editor, { type: ElementType.Paragraph }, { at: path });
    updatedNodes.push(node.id);
  }

  // Update the block refs in the other notes to be paragraphs
  const updateData: Pick<Note, 'id' | 'content'>[] = [];
  backlinks: for (const backlink of backlinks) {
    const noteEditor = createEditor();
    noteEditor.children = notes[backlink.id].content;

    for (const match of backlink.matches) {
      // Replace each block reference with a paragraph
      if (updatedNodes.includes(match.lineElement.id)) {
        // We've already updated this note, skip it
        continue backlinks;
      }
      Transforms.setNodes(
        noteEditor,
        { type: ElementType.Paragraph },
        { at: match.path }
      );
    }

    updateData.push({
      id: backlink.id,
      content: noteEditor.children,
    });
  }

  // Make sure block refs are updated locally
  for (const newNote of updateData) {
    store.getState().updateNote(newNote);
  }

  // It would be better if we could consolidate the update requests into one request
  // See https://github.com/supabase/supabase-js/issues/156
  const promises = [];
  for (const data of updateData) {
    promises.push(
      supabase
        .from<Note>('notes')
        .update({ content: data.content })
        .eq('id', data.id)
    );
  }
  await Promise.all(promises);
};

const withBlockReferences = (editor: Editor) => {
  const { apply } = editor;

  // Remove block references if the original block is deleted
  editor.apply = (operation) => {
    apply(operation);

    if (operation.type === 'merge_node') {
      const node = operation.properties;

      if (isPartialElement(node) && node.id) {
        replaceBlockRefs(editor, node.id);
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
        replaceBlockRefs(editor, node.id);
      }
    }
  };

  return editor;
};

export default withBlockReferences;
