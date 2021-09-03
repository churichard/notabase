import { useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import {
  IconH1,
  IconH2,
  IconH3,
  IconBlockquote,
  IconList,
  IconListNumbers,
  IconBraces,
  IconSwitch,
  IconTypography,
  TablerIcon,
} from '@tabler/icons';
import { Element } from 'slate';
import { toggleElement, isElementActive } from 'editor/formatting';
import { ElementType } from 'types/slate';
import Tooltip from 'components/Tooltip';
import { DropdownItem } from 'components/Dropdown';

type ChangeBlockOptionsProps = {
  element: Element;
};

export default function ChangeBlockOptions(props: ChangeBlockOptionsProps) {
  const { element } = props;
  return (
    <div className="px-4 py-2">
      <p className="flex items-center pb-2 select-none dark:text-gray-200">
        <IconSwitch size={18} className="mr-1" />
        <span>Turn block into:</span>
      </p>
      <div className="flex items-center justify-center pb-2 space-x-2">
        <BlockButton
          format={ElementType.Paragraph}
          element={element}
          Icon={IconTypography}
          tooltip="Paragraph"
        />
        <BlockButton
          format={ElementType.HeadingOne}
          element={element}
          Icon={IconH1}
          tooltip="Heading 1"
        />
        <BlockButton
          format={ElementType.HeadingTwo}
          element={element}
          Icon={IconH2}
          tooltip="Heading 2"
        />
        <BlockButton
          format={ElementType.HeadingThree}
          element={element}
          Icon={IconH3}
          tooltip="Heading 3"
        />
      </div>
      <div className="flex items-center justify-center space-x-2">
        <BlockButton
          format={ElementType.BulletedList}
          element={element}
          Icon={IconList}
          tooltip="Bulleted List"
        />
        <BlockButton
          format={ElementType.NumberedList}
          element={element}
          Icon={IconListNumbers}
          tooltip="Numbered List"
        />
        <BlockButton
          format={ElementType.Blockquote}
          element={element}
          Icon={IconBlockquote}
          tooltip="Quote Block"
        />
        <BlockButton
          format={ElementType.CodeBlock}
          element={element}
          Icon={IconBraces}
          tooltip="Code Block"
        />
      </div>
    </div>
  );
}

type BlockButtonProps = {
  format: ElementType;
  element: Element;
  Icon: TablerIcon;
  tooltip?: string;
  className?: string;
};

const BlockButton = ({
  format,
  element,
  Icon,
  tooltip,
  className = '',
}: BlockButtonProps) => {
  const editor = useSlate();
  const path = useMemo(
    () => ReactEditor.findPath(editor, element),
    [editor, element]
  );
  const isActive = isElementActive(editor, format, path);

  return (
    <Tooltip content={tooltip} placement="top" disabled={!tooltip}>
      <span>
        <DropdownItem
          className={`flex items-center px-2 py-2 cursor-pointer border rounded hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:border-gray-700 ${className}`}
          onClick={() => toggleElement(editor, format, path)}
        >
          <Icon
            size={18}
            className={
              isActive
                ? 'text-primary-500 dark:text-primary-400'
                : 'text-gray-800 dark:text-gray-200'
            }
          />
        </DropdownItem>
      </span>
    </Tooltip>
  );
};
