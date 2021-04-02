import React, { ReactNode } from 'react';
import { RenderElementProps } from 'slate-react';
import Tippy from '@tippyjs/react';
import Link from 'next/link';
import { ElementType, Link as LinkType } from 'types/slate';

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
    case ElementType.Link:
      if (element.url.startsWith('/')) {
        return (
          <NoteLink element={element} attributes={attributes}>
            {children}
          </NoteLink>
        );
      } else {
        return (
          <ExternalLink element={element} attributes={attributes}>
            {children}
          </ExternalLink>
        );
      }
    default:
      return (
        <p className="my-3" {...attributes}>
          {children}
        </p>
      );
  }
}

type NoteLinkProps = {
  element: LinkType;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
};

const NoteLink = (props: NoteLinkProps) => {
  const { element, children, attributes } = props;
  return (
    <Tippy
      content={element?.title ?? element.url}
      duration={0}
      placement="bottom"
    >
      <span>
        <Link href={element.url}>
          <a
            className="underline cursor-pointer text-primary-500"
            {...attributes}
          >
            {children}
          </a>
        </Link>
      </span>
    </Tippy>
  );
};

type ExternalLinkProps = {
  element: LinkType;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
};

const ExternalLink = (props: ExternalLinkProps) => {
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
