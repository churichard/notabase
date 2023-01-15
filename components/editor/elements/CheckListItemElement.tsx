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
      try {
        const path = ReactEditor.findPath(editor, element);
        const newProperties: Partial<CheckListItem> = {
          checked: event.target.checked,
        };
        Transforms.setNodes(editor, newProperties, { at: path });
      } catch (e) {
        const message = e instanceof Error ? e.message : e;
        console.error(
          `There was an error updating the checklist item: ${message}`
        );
      }
    },
    [editor, element, readOnly]
  );

  return (
    <div className={`flex items-center ${className}`} {...attributes}>
      <div
        className="mr-2 flex select-none items-center justify-center"
        contentEditable={false}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onInputChange}
          className="border-2 bg-transparent text-primary-500 hover:cursor-pointer hover:bg-gray-100 hover:text-primary-600 focus:ring-0 active:bg-gray-200 active:text-primary-700 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        />
      </div>
      <span
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={`flex-1 ${
          checked ? 'line-through opacity-60' : 'opacity-100'
        }`}
      >
        {children}
      </span>
    </div>
  );
}
