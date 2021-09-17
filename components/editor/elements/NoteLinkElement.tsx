import { ReactNode } from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
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
  const { className = '', element, children, attributes } = props;
  const currentNote = useCurrentNote();
  const { onClick: onNoteLinkClick, defaultStackingBehavior } =
    useOnNoteLinkClick(currentNote.id);
  const selected = useSelected();
  const focused = useFocused();
  const noteLinkClassName = `p-0.25 rounded text-primary-600 cursor-pointer select-none bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:text-primary-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className} ${
    selected && focused ? 'bg-primary-100 dark:bg-primary-900' : ''
  }`;

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
