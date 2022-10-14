import { $isAutoLinkNode, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  createCommand,
  LexicalCommand,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { getSelectedNode } from '../../utils/getSelectedNode';
import HoveringLinkEditor from './HoveringLinkEditor';

export const OPEN_LINK_EDITOR: LexicalCommand<void> = createCommand();

function useHoveringLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [showToolbar, setShowToolbar] = useState(false);
  const [initialEditMode, setInitialEditMode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent != null && autoLinkParent == null) {
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          setInitialEditMode(false);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        OPEN_LINK_EDITOR,
        (_payload, newEditor) => {
          setShowToolbar(true);
          setActiveEditor(newEditor);
          setInitialEditMode(true);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  return showToolbar
    ? createPortal(
        <HoveringLinkEditor
          editor={activeEditor}
          anchorElem={anchorElem}
          initialEditMode={initialEditMode}
        />,
        anchorElem
      )
    : null;
}

export default function HoveringLinkEditorPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useHoveringLinkEditorToolbar(editor, anchorElem);
}
