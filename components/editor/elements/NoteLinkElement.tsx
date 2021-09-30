import { ReactNode } from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import classNames from 'classnames';
import { NoteLink } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import Tooltip from 'components/Tooltip';
import { useCurrentNote } from 'utils/useCurrentNote';

type NoteLinkElementProps = {
  element: NoteLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function NoteLinkElement(props: NoteLinkElementProps) {
  const { className, element, children, attributes } = props;

  const currentNote = useCurrentNote();
  const { onClick: onNoteLinkClick, defaultStackingBehavior } =
    useOnNoteLinkClick(currentNote.id);

  const selected = useSelected();
  const focused = useFocused();
  const noteLinkClassName = classNames(
    'p-0.25 rounded cursor-pointer select-none border-b border-gray-200 text-primary-600 dark:text-primary-400 hover:bg-gray-100 active:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    { 'bg-primary-100 dark:bg-primary-900': selected && focused },
    className
  );

  return (
    <Tooltip content={element.noteTitle} placement="bottom-start">
      <span
        role="button"
        className={noteLinkClassName}
        onClick={(e) => {
          e.stopPropagation();
          onNoteLinkClick(element.noteId, defaultStackingBehavior(e));
        }}
        contentEditable={false}
        {...attributes}
      >
        {element.customText ?? element.noteTitle}
        {children}
      </span>
    </Tooltip>
  );
}
