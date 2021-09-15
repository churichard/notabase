import { ChangeEvent, ReactNode, useCallback } from 'react';
import { Transforms } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlateStatic,
} from 'slate-react';
import { CheckListItem } from 'types/slate';

type Props = {
  element: CheckListItem;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function CheckListItemElement(props: Props) {
  const { attributes, children, element, className } = props;
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const { checked } = element;

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (readOnly) {
        return;
      }
      const path = ReactEditor.findPath(editor, element);
      const newProperties: Partial<CheckListItem> = {
        checked: event.target.checked,
      };
      Transforms.setNodes(editor, newProperties, { at: path });
    },
    [editor, element, readOnly]
  );

  return (
    <div className={`flex items-center ${className}`} {...attributes}>
      <div
        className="flex items-center justify-center mr-2 select-none"
        contentEditable={false}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onInputChange}
          className="bg-transparent border-2 hover:cursor-pointer text-primary-500 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700 focus:ring-0 hover:text-primary-600 active:text-primary-700"
        />
      </div>
      <span
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={`flex-1 ${
          checked ? 'opacity-60 line-through' : 'opacity-100'
        }`}
      >
        {children}
      </span>
    </div>
  );
}
