import { ReactNode, useMemo, useEffect, useState } from 'react';
import type { Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import type { Placement, VirtualElement } from '@popperjs/core';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';
import useOnClickOutside from 'utils/useOnClickOutside';
import useHotkeys from 'utils/useHotkeys';

type Props = {
  children: ReactNode;
  className?: string;
  placement?: Placement;
  selection?: Range;
  onClose?: () => void;
};

export default function EditorPopover(props: Props) {
  const { children, className = '', placement, selection, onClose } = props;
  const editor = useSlate();

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
  useOnClickOutside(popperElement, onClose);

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'esc',
        callback: () => onClose?.(),
      },
    ],
    [onClose]
  );
  useHotkeys(hotkeys);

  // Update popover reference element when the editor changes
  useEffect(() => {
    // Returns the DOM range of the prop selection or the window selection
    const getDOMRange = () => {
      // Use the selection prop if it was passed in; otherwise, use the window selection
      if (selection) {
        try {
          return ReactEditor.toDOMRange(editor, selection);
        } catch (e) {
          // Do nothing - use window selection instead
        }
      }
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        return domSelection.getRangeAt(0);
      }
      return null;
    };

    // Virtual element to be used as the popover reference element
    // We need this in order to position the popover relative to the selection (not just the DOM node)
    const virtualElement = {
      getBoundingClientRect: () =>
        getDOMRange()?.getBoundingClientRect() ?? new DOMRect(),
      contextElement: getDOMRange()?.startContainer.parentElement ?? undefined,
    };

    setReferenceElement(virtualElement);
  }, [editor, editor.selection, selection]);

  return (
    <Portal>
      <div
        ref={setPopperElement}
        className={`z-10 flex items-stretch overflow-hidden transition-opacity bg-white border rounded shadow-popover dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 ${className}`}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </Portal>
  );
}
