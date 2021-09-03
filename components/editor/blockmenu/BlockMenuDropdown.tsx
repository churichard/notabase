import { useCallback, useMemo } from 'react';
import { Element, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { IconDotsVertical, IconLink } from '@tabler/icons';
import { ReferenceableBlockElement, ElementType } from 'types/slate';
import Dropdown, { DropdownItem } from 'components/Dropdown';
import { isReferenceableBlockElement } from 'editor/checks';
import { createNodeId } from 'editor/plugins/withNodeId';
import ChangeBlockOptions from './ChangeBlockOptions';

type BlockMenuDropdownProps = {
  element: ReferenceableBlockElement;
};

export default function BlockMenuDropdown(props: BlockMenuDropdownProps) {
  const { element } = props;
  const editor = useSlateStatic();

  const onCopyBlockRef = useCallback(async () => {
    let blockId;

    // We still need this because there are cases where block ids might not exist
    if (!element.id) {
      // Generate block id if it doesn't exist
      blockId = createNodeId();
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
        <IconDotsVertical
          className="text-gray-500 dark:text-gray-400"
          size={18}
        />
      </span>
    ),
    []
  );

  const buttonClassName = useMemo(() => {
    const className =
      'hidden group-hover:block select-none hover:bg-gray-200 active:bg-gray-300 rounded absolute top-0.5 dark:hover:bg-gray-800 dark:active:bg-gray-700';
    if (element.type === ElementType.ListItem) {
      return `${className} -left-16`;
    } else {
      return `${className} -left-8`;
    }
  }, [element.type]);

  return (
    <Dropdown
      buttonChildren={buttonChildren}
      buttonClassName={buttonClassName}
      placement="left-start"
      offset={[0, 6]}
      tooltipContent={<span className="text-xs">Click to open menu</span>}
      tooltipPlacement="bottom"
    >
      <DropdownItem onClick={onCopyBlockRef}>
        <IconLink size={18} className="mr-1" />
        <span>Copy block reference</span>
      </DropdownItem>
      <ChangeBlockOptions
        element={element}
        className="px-4 py-2 border-t dark:border-gray-700"
      />
    </Dropdown>
  );
}
