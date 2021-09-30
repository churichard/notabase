import { ReactNode } from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import classNames from 'classnames';
import { Tag } from 'types/slate';

type Props = {
  element: Tag;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function TagElement(props: Props) {
  const { className, element, children, attributes } = props;

  const selected = useSelected();
  const focused = useFocused();
  const tagClassName = classNames(
    'p-0.25 rounded cursor-pointer select-none border-b border-gray-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 active:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    { 'bg-primary-100 dark:bg-primary-900': selected && focused },
    className
  );

  return (
    <span
      role="button"
      className={tagClassName}
      onClick={(e) => {
        e.stopPropagation();
        // TODO: handle click
      }}
      contentEditable={false}
      {...attributes}
    >
      #{element.name}
      {children}
    </span>
  );
}
