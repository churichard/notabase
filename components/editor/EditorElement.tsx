import { ReactNode } from 'react';
import type { RenderElementProps } from 'slate-react';
import Tippy from '@tippyjs/react';
import Link from 'next/link';
import type { ExternalLink, NoteLink } from 'types/slate';
import { ElementType } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';

type Props = {
  omitVerticalSpacing: boolean;
} & RenderElementProps;

export default function EditorElement(props: Props) {
  const { omitVerticalSpacing, attributes, children, element } = props;

  switch (element.type) {
    case ElementType.HeadingOne:
      return (
        <h1
          className={`text-2xl font-semibold ${
            omitVerticalSpacing ? '' : 'my-3'
          }`}
          {...attributes}
        >
          {children}
        </h1>
      );
    case ElementType.HeadingTwo:
      return (
        <h2
          className={`text-xl font-semibold ${
            omitVerticalSpacing ? '' : 'my-3'
          }`}
          {...attributes}
        >
          {children}
        </h2>
      );
    case ElementType.HeadingThree:
      return (
        <h3
          className={`text-lg font-semibold ${
            omitVerticalSpacing ? '' : 'my-3'
          }`}
          {...attributes}
        >
          {children}
        </h3>
      );
    case ElementType.ListItem:
      return (
        <li
          className={`pl-1 ${omitVerticalSpacing ? '' : 'my-2'}`}
          {...attributes}
        >
          {children}
        </li>
      );
    case ElementType.BulletedList:
      return (
        <ul
          className={`ml-8 list-disc ${omitVerticalSpacing ? '' : 'my-2'}`}
          {...attributes}
        >
          {children}
        </ul>
      );
    case ElementType.NumberedList:
      return (
        <ol
          className={`ml-8 list-decimal ${omitVerticalSpacing ? '' : 'my-2'}`}
          {...attributes}
        >
          {children}
        </ol>
      );
    case ElementType.Blockquote:
      return (
        <blockquote
          className={`pl-4 border-l-4 ${omitVerticalSpacing ? '' : 'my-3'}`}
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case ElementType.CodeBlock:
      return (
        <code
          className={`block p-2 bg-gray-200 rounded text-primary-800 ${
            omitVerticalSpacing ? '' : 'my-3'
          }`}
          {...attributes}
        >
          {children}
        </code>
      );
    case ElementType.ExternalLink:
      return (
        <ExternalLinkElement element={element} attributes={attributes}>
          {children}
        </ExternalLinkElement>
      );
    case ElementType.NoteLink:
      return (
        <NoteLinkElement element={element} attributes={attributes}>
          {children}
        </NoteLinkElement>
      );
    default:
      return (
        <p className={omitVerticalSpacing ? '' : 'my-3'} {...attributes}>
          {children}
        </p>
      );
  }
}

type NoteLinkElementProps = {
  element: NoteLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
};

const NoteLinkElement = (props: NoteLinkElementProps) => {
  const { element, children, attributes } = props;
  const onNoteLinkClick = useOnNoteLinkClick();
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);

  return (
    <Tippy content={element.noteTitle} duration={0} placement="bottom">
      {isPageStackingOn ? (
        <span
          className="link"
          onClick={() => onNoteLinkClick(element.noteId)}
          {...attributes}
        >
          {children}
        </span>
      ) : (
        <span>
          <Link href={`/app/note/${element.noteId}`}>
            <a className="link" {...attributes}>
              {children}
            </a>
          </Link>
        </span>
      )}
    </Tippy>
  );
};

type ExternalLinkElementProps = {
  element: ExternalLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
};

const ExternalLinkElement = (props: ExternalLinkElementProps) => {
  const { element, children, attributes } = props;
  return (
    <Tippy content={element.url} duration={0} placement="bottom">
      <a
        className="link"
        href={element.url}
        onClick={() =>
          window.open(element.url, '_blank', 'noopener noreferrer')
        }
        {...attributes}
      >
        {children}
      </a>
    </Tippy>
  );
};
