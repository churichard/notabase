import { ComponentType, useCallback, useMemo } from 'react';
import { Element, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { IconDotsVertical, IconLink } from '@tabler/icons';
import { v4 as uuidv4 } from 'uuid';
import { BlockElementWithId, ElementType } from 'types/slate';
import Dropdown, { DropdownItem } from 'components/Dropdown';
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

  const buttonChildren = useMemo(
    () => <IconDotsVertical className="text-gray-500" size={18} />,
    []
  );

  return (
    <Dropdown
      buttonChildren={buttonChildren}
      buttonClassName={`hidden group-hover:block hover:bg-gray-200 active:bg-gray-300 rounded p-0.5 absolute top-0.5 ${className}`}
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
