import { ComponentType, useCallback, useMemo, useRef, useState } from 'react';
import { Element, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { IconDotsVertical, IconLink } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { Menu } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';
import { BlockElementWithId, ElementType } from 'types/slate';
import Tooltip from 'components/Tooltip';
import Portal from 'components/Portal';
import { isElementWithBlockId } from 'editor/blockReferences';
import { EditorElementProps } from './EditorElement';

export const withOptionsMenu = (
  EditorElement: ComponentType<EditorElementProps>
) => {
  const EditorElementWithOptionsMenu = (props: EditorElementProps) => {
    const { children, className, ...otherProps } = props;
    const element = props.element;

    const optionsMenuButtonPosition = useMemo(() => {
      if (element.type === ElementType.ListItem) {
        return '-left-14';
      } else if (element.type === ElementType.Blockquote) {
        return '-left-7';
      } else {
        return '-left-6';
      }
    }, [element.type]);

    if (!isElementWithBlockId(element)) {
      return <EditorElement {...props} />;
    }

    return (
      <EditorElement
        className={`relative w-full group before:absolute before:top-0 before:bottom-0 before:w-full before:right-full ${className}`}
        {...otherProps}
      >
        {children}
        <OptionsMenuDropdown
          element={element}
          className={optionsMenuButtonPosition}
        />
      </EditorElement>
    );
  };

  return EditorElementWithOptionsMenu;
};

type OptionsMenuDropdownProps = {
  element: BlockElementWithId;
  className?: string;
};

const OptionsMenuDropdown = (props: OptionsMenuDropdownProps) => {
  const { element, className } = props;
  const editor = useSlateStatic();

  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(buttonRef.current, popperElement, {
    placement: 'left',
    modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
  });

  const onCopyBlockRef = useCallback(async () => {
    let blockRef;

    if (!element.id) {
      // Generate block id if it doesn't exist
      blockRef = uuidv4();
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(
        editor,
        { id: blockRef },
        {
          at: path,
          match: (n) => Element.isElement(n) && n.type === element.type,
        }
      );
    } else {
      // Use the existing block id
      blockRef = element.id;
    }

    navigator.clipboard.writeText(`((${blockRef}))`);
  }, [editor, element]);

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            className={`hidden group-hover:block hover:bg-gray-200 rounded p-0.5 absolute top-0.5 ${className}`}
          >
            <Tooltip
              content={<span className="text-xs">Click to open menu</span>}
              delay={[200, 0]}
              placement="bottom"
            >
              <span ref={buttonRef}>
                <IconDotsVertical className="text-gray-500" size={18} />
              </span>
            </Tooltip>
          </Menu.Button>
          {open && (
            <Portal>
              <Menu.Items
                ref={setPopperElement}
                className="z-10 w-48 overflow-hidden text-sm bg-white rounded shadow-popover"
                static
                style={styles.popper}
                {...attributes.popper}
              >
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
                        active ? 'bg-gray-100' : ''
                      }`}
                      onClick={onCopyBlockRef}
                    >
                      <IconLink size={18} className="mr-1" />
                      <span>Copy block reference</span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
};
