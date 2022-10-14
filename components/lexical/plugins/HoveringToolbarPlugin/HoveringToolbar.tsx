import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import * as React from 'react';
import {
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons';
import { getDOMRangeRect } from '../../utils/getDOMRangeRect';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { OPEN_LINK_EDITOR } from '../HoveringLinkEditorPlugin';
import styles from './index.module.css';
import HoveringToolbarButton from './HoveringToolbarButton';

export default function HoveringToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    editor.dispatchCommand(OPEN_LINK_EDITOR, undefined);
  }, [editor]);

  const updateHoveringToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateHoveringToolbar();
      });
    };

    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, updateHoveringToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateHoveringToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateHoveringToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateHoveringToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateHoveringToolbar]);

  return (
    <div
      ref={popupCharStylesEditorRef}
      className={styles['floating-text-format-popup']}
    >
      {editor.isEditable() && (
        <>
          <HoveringToolbarButton
            icon={IconLink}
            onClick={insertLink}
            isActive={isLink}
            text="Link"
            tooltip="Link to a note or web page (Ctrl+K)"
            aria-label="Link to a note or web page"
            className="border-r dark:border-gray-700"
          />
          <HoveringToolbarButton
            icon={IconBold}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            isActive={isBold}
            tooltip="Bold (Ctrl+B)"
            aria-label="Bold"
          />
          <HoveringToolbarButton
            icon={IconItalic}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
            isActive={isItalic}
            tooltip="Italic (Ctrl+I)"
            aria-label="Italic"
          />
          <HoveringToolbarButton
            icon={IconUnderline}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
            isActive={isUnderline}
            tooltip="Underline (Ctrl+U)"
            aria-label="Underline"
          />
          <HoveringToolbarButton
            icon={IconStrikethrough}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
            isActive={isStrikethrough}
            tooltip="Strikethrough (Ctrl+Shift+S)"
            aria-label="Strikethrough"
          />
          <HoveringToolbarButton
            icon={IconCode}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            isActive={isCode}
            tooltip="Code (Ctrl+`)"
            aria-label="Code"
          />
        </>
      )}
    </div>
  );
}
