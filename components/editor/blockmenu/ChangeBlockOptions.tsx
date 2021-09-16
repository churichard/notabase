import { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import {
  IconH1,
  IconH2,
  IconH3,
  IconBlockquote,
  IconList,
  IconListNumbers,
  IconBraces,
  IconTypography,
  TablerIcon,
  IconPhoto,
  IconListCheck,
} from '@tabler/icons';
import { Element } from 'slate';
import { toggleElement, isElementActive } from 'editor/formatting';
import { ElementType } from 'types/slate';
import Tooltip from 'components/Tooltip';
import { DropdownItem } from 'components/Dropdown';
import { uploadAndInsertImage } from 'editor/plugins/withImages';

type ChangeBlockOptionsProps = {
  element: Element;
  className?: string;
};

export default function ChangeBlockOptions(props: ChangeBlockOptionsProps) {
  const { element, className = '' } = props;
  return (
    <div className={`divide-y dark:divide-gray-700 ${className}`}>
      <div className="flex items-center justify-center">
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
      <div className="flex items-center justify-center">
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
          format={ElementType.CheckListItem}
          element={element}
          Icon={IconListCheck}
          tooltip="Checklist"
        />
      </div>
      <div className="flex items-center justify-center">
        <ImageButton
          format={ElementType.Image}
          element={element}
          Icon={IconPhoto}
          tooltip="Image"
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
          className={`flex items-center px-2 py-2 cursor-pointer rounded hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className}`}
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

const ImageButton = ({
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

  const onClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.className = 'absolute invisible hidden w-0 h-0';

    input.onchange = async (e) => {
      if (!e.target) {
        document.body.removeChild(input);
        return;
      }

      const inputElement = e.target as HTMLInputElement;

      if (!inputElement.files || inputElement.files.length <= 0) {
        document.body.removeChild(input);
        return;
      }

      await uploadAndInsertImage(editor, inputElement.files[0], path);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }, [editor, path]);

  return (
    <Tooltip content={tooltip} placement="top" disabled={!tooltip}>
      <span>
        <DropdownItem
          className={`flex items-center px-2 py-2 cursor-pointer rounded hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className}`}
          onClick={onClick}
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
