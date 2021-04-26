import React, { ReactNode } from 'react';
import { RenderElementProps } from 'slate-react';
import Tippy from '@tippyjs/react';
import { ElementType, ExternalLink, NoteLink } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';

export default function EditorElement({
  attributes,
  children,
  element,
}: RenderElementProps) {
  switch (element.type) {
    case ElementType.HeadingOne:
      return (
        <h1 className="my-3 text-2xl font-semibold" {...attributes}>
          {children}
        </h1>
      );
    case ElementType.HeadingTwo:
      return (
        <h2 className="my-3 text-xl font-semibold" {...attributes}>
          {children}
        </h2>
      );
    case ElementType.HeadingThree:
      return (
        <h3 className="my-3 text-lg font-semibold" {...attributes}>
          {children}
        </h3>
      );
    case ElementType.ListItem:
      return (
        <li className="pl-1 my-2" {...attributes}>
          {children}
        </li>
      );
    case ElementType.BulletedList:
      return (
        <ul className="my-3 ml-8 list-disc" {...attributes}>
          {children}
        </ul>
      );
    case ElementType.NumberedList:
      return (
        <ol className="my-3 ml-8 list-decimal" {...attributes}>
          {children}
        </ol>
      );
    case ElementType.Blockquote:
      return (
        <blockquote className="pl-4 my-3 border-l-4" {...attributes}>
          {children}
        </blockquote>
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
        <p className="my-3" {...attributes}>
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
  const onNoteLinkClick = useOnNoteLinkClick(element.noteId);

  return (
    <Tippy content={element.noteTitle} duration={0} placement="bottom">
      <button
        className="underline cursor-pointer text-primary-500"
        onClick={onNoteLinkClick}
        {...attributes}
      >
        {children}
      </button>
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
        className="underline cursor-pointer text-primary-500"
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
