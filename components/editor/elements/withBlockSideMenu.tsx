import {
  ComponentType,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  Fragment,
} from 'react';
import { Element, Node, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { IconDotsVertical, IconLink } from '@tabler/icons';
import { v4 as uuidv4 } from 'uuid';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { ReferenceableBlockElement, ElementType } from 'types/slate';
import Dropdown, { DropdownItem } from 'components/Dropdown';
import Portal from 'components/Portal';
import { isReferenceableBlockElement } from 'editor/checks';
import useBlockBacklinks from 'editor/backlinks/useBlockBacklinks';
import updateBlockBacklinks from 'editor/backlinks/updateBlockBacklinks';
import BlockBacklinks from '../backlinks/BlockBacklinks';
import { getNumOfMatches } from '../backlinks/Backlinks';
import { EditorElementProps } from './EditorElement';

export default function withBlockSideMenu(
  EditorElement: ComponentType<EditorElementProps>
) {
  const ElementWithSideMenu = (props: EditorElementProps) => {
    const { element } = props;

    if (!isReferenceableBlockElement(element)) {
      return <EditorElement {...props} />;
    }

    return (
      <div className="relative w-full group before:absolute before:top-0 before:bottom-0 before:w-full before:right-full">
        <EditorElement {...props} />
        <OptionsMenuDropdown element={element} />
        <BacklinksPopover element={element} />
      </div>
    );
  };

  return ElementWithSideMenu;
}

type OptionsMenuDropdownProps = {
  element: ReferenceableBlockElement;
};

const OptionsMenuDropdown = (props: OptionsMenuDropdownProps) => {
  const { element } = props;
  const editor = useSlateStatic();

  const onCopyBlockRef = useCallback(async () => {
    let blockId;

    if (!element.id) {
      // Generate block id if it doesn't exist
      blockId = uuidv4();
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(
        editor,
        { id: blockId },
        {
          at: path,
          match: (n) =>
            Element.isElement(n) &&
            isReferenceableBlockElement(n) &&
            n.type === element.type,
        }
      );
    } else {
      // Use the existing block id
      blockId = element.id;
    }

    navigator.clipboard.writeText(`((${blockId}))`);
  }, [editor, element]);

  const buttonChildren = useMemo(
    () => (
      <span className="flex items-center justify-center w-6 h-6">
        <IconDotsVertical className="text-gray-500" size={18} />
      </span>
    ),
    []
  );

  const buttonClassName = useMemo(() => {
    const className =
      'hidden group-hover:block select-none hover:bg-gray-200 active:bg-gray-300 rounded absolute top-0.5';
    if (element.type === ElementType.ListItem) {
      return `${className} -left-16`;
    } else if (element.type === ElementType.Blockquote) {
      return `${className} -left-10`;
    } else {
      return `${className} -left-8`;
    }
  }, [element.type]);

  return (
    <Dropdown
      buttonChildren={buttonChildren}
      buttonClassName={buttonClassName}
      placement="left"
      offset={[0, 6]}
      tooltipContent={<span className="text-xs">Click to open menu</span>}
      tooltipPlacement="bottom"
    >
      <DropdownItem onClick={onCopyBlockRef}>
        <IconLink size={18} className="mr-1" />
        <span>Copy block reference</span>
      </DropdownItem>
    </Dropdown>
  );
};

const UPDATE_BLOCK_BACKLINKS_DEBOUNCE_MS = 500;

type BacklinksPopoverProps = { element: ReferenceableBlockElement };

const BacklinksPopover = (props: BacklinksPopoverProps) => {
  const { element } = props;
  const elementId = element.id ?? null;
  const blockBacklinks = useBlockBacklinks(elementId);

  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes, state } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: 'bottom-end',
      modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
    }
  );

  const numOfMatches = useMemo(
    () => getNumOfMatches(blockBacklinks),
    [blockBacklinks]
  );

  // Update block references with the proper text when the block has changed
  const currentElementText = useMemo(() => Node.string(element), [element]);
  const prevSavedElementText = useRef<string>(currentElementText);
  useEffect(() => {
    // Only update if it is not the first render, there are backlinks, and the element text has updated
    if (
      numOfMatches > 0 &&
      prevSavedElementText.current !== currentElementText
    ) {
      const handler = setTimeout(() => {
        updateBlockBacklinks(blockBacklinks, currentElementText);
        prevSavedElementText.current = currentElementText;
      }, UPDATE_BLOCK_BACKLINKS_DEBOUNCE_MS);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [numOfMatches, currentElementText, blockBacklinks]);

  return numOfMatches > 0 ? (
    <Popover as={Fragment}>
      {({ open }) => (
        <>
          <Popover.Button
            ref={setReferenceElement}
            className="absolute flex items-center select-none justify-center w-6 h-6 text-sm font-medium rounded text-primary-700 top-0.5 -right-8 hover:bg-gray-100 active:bg-gray-200"
            contentEditable={false}
          >
            {numOfMatches}
          </Popover.Button>
          {open && (
            <Portal>
              <Popover.Panel
                className={`z-10 p-2 overflow-y-auto bg-white rounded shadow-popover w-64 md:w-96 lg:w-128 max-h-128 ${
                  state?.modifiersData.hide?.isReferenceHidden
                    ? 'invisible pointer-events-none'
                    : ''
                }`}
                contentEditable={false}
                static
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                <BlockBacklinks backlinks={blockBacklinks} />
              </Popover.Panel>
            </Portal>
          )}
        </>
      )}
    </Popover>
  ) : null;
};
