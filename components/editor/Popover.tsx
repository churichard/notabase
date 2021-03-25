import React, { ReactNode, useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Placement, VirtualElement } from '@popperjs/core';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';
import useOnClickOutside from 'utils/useOnClickOutside';

type Props = {
  children: ReactNode;
  className?: string;
  placement?: Placement;
  isVisibleOverride?: boolean; // Overrides any visibility setting
  onClickOutside?: (event: Event) => void; // Called when mouse is clicked outside the popover
};

export default function Popover(props: Props) {
  const {
    children,
    className = '',
    placement,
    isVisibleOverride,
    onClickOutside,
  } = props;
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
      // We need to disable gpu acceleration in order to fix text selection breaking when selecting over the popover
      { name: 'computeStyles', options: { gpuAcceleration: false } },
    ],
  });
  const editor = useSlate();

  useOnClickOutside(popperElement, onClickOutside);

  // Update popover reference element when the editor changes
  useEffect(() => {
    const { onChange } = editor;
    editor.onChange = () => {
      // Update popover reference element if there is a selection and the editor is focused
      if (editor.selection && ReactEditor.isFocused(editor)) {
        setReferenceElement(getReferenceElementFromSelection());
      }
      onChange();
    };
  }, [editor]);

  // Update popover visibility whenever the component re-renders
  useEffect(() => {
    if (!popperElement || !editor.selection || !ReactEditor.isFocused(editor)) {
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
      popperElement.style.opacity = '0';
      popperElement.style.visibility = 'hidden';
    } else {
      popperElement.style.opacity = '1';
      popperElement.style.visibility = 'visible';
    }
  });

  return (
    <Portal>
      <div
        ref={setPopperElement}
        className={`z-10 flex items-stretch invisible overflow-hidden transition-opacity bg-white border rounded-md opacity-0 shadow-popover ${className}`}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </Portal>
  );
}

// Returns a virtual element to be used as the popover reference element
const getReferenceElementFromSelection = () => {
  const domSelection = window.getSelection();
  if (domSelection && domSelection.rangeCount > 0) {
    return {
      getBoundingClientRect: () =>
        domSelection.getRangeAt(0).getBoundingClientRect(),
      contextElement:
        domSelection.getRangeAt(0).startContainer.parentElement ?? undefined,
    };
  }
  return null;
};
