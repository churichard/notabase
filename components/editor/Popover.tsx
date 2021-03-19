import React, { ReactElement, useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Placement, VirtualElement } from '@popperjs/core';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';

type Props = {
  children: ReactElement | Array<ReactElement>;
  placement?: Placement;
  isVisibleOverride?: boolean; // Overrides any visibility setting
};

export default function Popover(props: Props) {
  const { children, placement, isVisibleOverride } = props;
  const [referenceElement, setReferenceElement] = useState<
    Element | VirtualElement | null
  >(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: 'offset', options: { offset: [0, 12] } },
      // We need to disable gpu acceleration in order to fix text selection breaking
      { name: 'computeStyles', options: { gpuAcceleration: false } },
    ],
  });
  const editor = useSlate();

  useEffect(() => {
    const { onChange } = editor;

    editor.onChange = () => {
      if (
        !popperElement ||
        !editor.selection ||
        !ReactEditor.isFocused(editor)
      ) {
        onChange();
        return;
      }

      // If isVisibleOverride is defined, hide the popover if it is false
      // If isVisibleOverride is undefined, hide the popover if no text is being selected
      const shouldHidePopover =
        isVisibleOverride === undefined
          ? Range.isCollapsed(editor.selection) ||
            Editor.string(editor, editor.selection) === ''
          : !isVisibleOverride;

      if (shouldHidePopover) {
        // Hide the toolbar if no text is being selected
        popperElement.style.opacity = '0';
        popperElement.style.visibility = 'hidden';
      } else {
        // Show the toolbar
        popperElement.style.opacity = '1';
        popperElement.style.visibility = 'visible';
      }

      // Update popover position
      const domSelection = window.getSelection();
      const domRange = domSelection?.getRangeAt(0);
      const parentElement = domRange?.startContainer.parentElement;

      const virtualElement = {
        getBoundingClientRect: getSelectionBoundingClientRect,
        contextElement: parentElement ?? undefined,
      };
      setReferenceElement(virtualElement);

      onChange();
    };
  }, [editor, popperElement, isVisibleOverride]);

  useEffect(() => {
    if (!popperElement || isVisibleOverride === undefined) {
      return;
    }

    if (isVisibleOverride) {
      popperElement.style.opacity = '1';
      popperElement.style.visibility = 'visible';
    } else {
      popperElement.style.opacity = '0';
      popperElement.style.visibility = 'hidden';
    }
  }, [popperElement, isVisibleOverride]);

  return (
    <Portal>
      <div
        ref={setPopperElement}
        className="z-10 flex items-stretch invisible overflow-hidden transition-opacity bg-white border rounded-md opacity-0 shadow-popover"
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </Portal>
  );
}

// Returns a DOM rect corresponding to the current editor text selection
const getSelectionBoundingClientRect = () => {
  const domSelection = window.getSelection();
  const domRange = domSelection?.getRangeAt(0);
  const rect = domRange?.getBoundingClientRect();
  return rect ?? new DOMRect();
};
