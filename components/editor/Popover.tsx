import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Placement, VirtualElement } from '@popperjs/core';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';
import useOnClickOutside from 'utils/useOnClickOutside';

type Props = {
  children: ReactNode;
  className?: string;
  placement?: Placement;
  selection?: Range;
  onClickOutside?: (event: Event) => void; // Called when mouse is clicked outside the popover
};

export default function Popover(props: Props) {
  const {
    children,
    className = '',
    placement,
    selection,
    onClickOutside,
  } = props;
  const editor = useSlate();

  // Returns a virtual element to be used as the popover reference element
  const getReferenceElementFromSelection = useCallback(() => {
    const getDomRange = () => {
      if (selection) {
        return ReactEditor.toDOMRange(editor, selection);
      }
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        return domSelection.getRangeAt(0);
      }
      return null;
    };
    return {
      getBoundingClientRect: () => {
        return getDomRange()?.getBoundingClientRect() ?? new DOMRect();
      },
      contextElement: getDomRange()?.startContainer.parentElement ?? undefined,
    };
  }, [editor, selection]);

  const [referenceElement, setReferenceElement] = useState<
    Element | VirtualElement | null
  >(getReferenceElementFromSelection());
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
  useOnClickOutside(popperElement, onClickOutside);

  // Update popover reference element when the editor changes
  useEffect(() => {
    let isMounted = true;
    const { onChange } = editor;

    editor.onChange = () => {
      // Update popover reference element if there is a selection and the editor is focused
      if (isMounted && editor.selection && ReactEditor.isFocused(editor)) {
        setReferenceElement(getReferenceElementFromSelection());
      }
      onChange();
    };

    return () => {
      isMounted = false;
    };
  }, [editor, getReferenceElementFromSelection]);

  return (
    <Portal>
      <div
        ref={setPopperElement}
        className={`z-10 flex items-stretch overflow-hidden transition-opacity bg-white border rounded-md shadow-popover ${className}`}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </Portal>
  );
}
