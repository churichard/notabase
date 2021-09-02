import { ReactNode } from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import Link from 'next/link';
import { NoteLink } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';

type NoteLinkElementProps = {
  element: NoteLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function NoteLinkElement(props: NoteLinkElementProps) {
  const { className = '', element, children, attributes } = props;
  const onNoteLinkClick = useOnNoteLinkClick();
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);
  const selected = useSelected();
  const focused = useFocused();
  const noteLinkClassName = `p-0.25 rounded text-primary-600 cursor-pointer select-none bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:text-primary-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className} ${
    selected && focused ? 'bg-primary-100 dark:bg-primary-900' : ''
  }`;

  return (
    <Tooltip content={element.noteTitle} placement="bottom-start">
      {isPageStackingOn ? (
        <span
          className={noteLinkClassName}
          onClick={(e) => {
            e.stopPropagation();
            onNoteLinkClick(element.noteId);
          }}
          contentEditable={false}
          {...attributes}
        >
          {element.customText ?? element.noteTitle}
          {children}
        </span>
      ) : (
        <span>
          <Link href={`/app/note/${element.noteId}`}>
            <a
              className={noteLinkClassName}
              contentEditable={false}
              onClick={(e) => e.stopPropagation()}
              {...attributes}
            >
              {element.customText ?? element.noteTitle}
              {children}
            </a>
          </Link>
        </span>
      )}
    </Tooltip>
  );
}
