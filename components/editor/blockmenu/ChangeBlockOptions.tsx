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
        <BlockButton format={ElementType.Paragraph} element={element} />
        <BlockButton format={ElementType.HeadingOne} element={element} />
        <BlockButton format={ElementType.HeadingTwo} element={element} />
        <BlockButton format={ElementType.HeadingThree} element={element} />
      </div>
      <div className="flex items-center justify-center space-x-2">
        <BlockButton format={ElementType.BulletedList} element={element} />
        <BlockButton format={ElementType.NumberedList} element={element} />
        <BlockButton format={ElementType.Blockquote} element={element} />
        <BlockButton format={ElementType.CodeBlock} element={element} />
      </div>
    </div>
  );
}

type BlockButtonProps = {
  format: ElementType;
  element: Element;
  className?: string;
};

const BlockButton = ({ format, element, className = '' }: BlockButtonProps) => {
  const editor = useSlate();
  const path = useMemo(
    () => ReactEditor.findPath(editor, element),
    [editor, element]
  );
  const isActive = isElementActive(editor, format, path);

  const Icon = useMemo(() => {
    switch (format) {
      case ElementType.Paragraph:
        return IconTypography;
      case ElementType.HeadingOne:
        return IconH1;
      case ElementType.HeadingTwo:
        return IconH2;
      case ElementType.HeadingThree:
        return IconH3;
      case ElementType.BulletedList:
        return IconList;
      case ElementType.NumberedList:
        return IconListNumbers;
      case ElementType.Blockquote:
        return IconBlockquote;
      case ElementType.CodeBlock:
        return IconBraces;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  const tooltip = useMemo(() => {
    switch (format) {
      case ElementType.Paragraph:
        return 'Paragraph';
      case ElementType.HeadingOne:
        return 'Heading 1';
      case ElementType.HeadingTwo:
        return 'Heading 2';
      case ElementType.HeadingThree:
        return 'Heading 3';
      case ElementType.BulletedList:
        return 'Bulleted List';
      case ElementType.NumberedList:
        return 'Numbered List';
      case ElementType.Blockquote:
        return 'Quote Block';
      case ElementType.CodeBlock:
        return 'Code Block';
      default:
        return undefined;
    }
  }, [format]);

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
