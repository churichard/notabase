import { ReactNode, useMemo } from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import Tippy from '@tippyjs/react';
import Link from 'next/link';
import type { ExternalLink, Image as ImageType, NoteLink } from 'types/slate';
import { ElementType } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';

type Props = {
  omitVerticalSpacing: boolean;
} & RenderElementProps;

export default function EditorElement(props: Props) {
  const { omitVerticalSpacing, attributes, children, element } = props;

  const verticalSpacing = useMemo(() => {
    if (omitVerticalSpacing) {
      return '';
    } else if (
      element.type === ElementType.ListItem ||
      element.type === ElementType.BulletedList ||
      element.type === ElementType.NumberedList
    ) {
      return 'my-2';
    } else {
      return 'my-3';
    }
  }, [element.type, omitVerticalSpacing]);

  switch (element.type) {
    case ElementType.HeadingOne:
      return (
        <h1
          className={`text-2xl font-semibold ${verticalSpacing}`}
          {...attributes}
        >
          {children}
        </h1>
      );
    case ElementType.HeadingTwo:
      return (
        <h2
          className={`text-xl font-semibold ${verticalSpacing}`}
          {...attributes}
        >
          {children}
        </h2>
      );
    case ElementType.HeadingThree:
      return (
        <h3
          className={`text-lg font-semibold ${verticalSpacing}`}
          {...attributes}
        >
          {children}
        </h3>
      );
    case ElementType.ListItem:
      return (
        <li className={`pl-1 ${verticalSpacing}`} {...attributes}>
          {children}
        </li>
      );
    case ElementType.BulletedList:
      return (
        <ul className={`ml-8 list-disc ${verticalSpacing}`} {...attributes}>
          {children}
        </ul>
      );
    case ElementType.NumberedList:
      return (
        <ol className={`ml-8 list-decimal ${verticalSpacing}`} {...attributes}>
          {children}
        </ol>
      );
    case ElementType.Blockquote:
      return (
        <blockquote
          className={`pl-4 border-l-4 ${verticalSpacing}`}
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case ElementType.CodeBlock:
      return (
        <code
          className={`block p-2 bg-gray-100 border border-gray-200 rounded ${verticalSpacing}`}
          {...attributes}
        >
          {children}
        </code>
      );
    case ElementType.ThematicBreak:
      return (
        <ThematicBreak className={verticalSpacing} attributes={attributes}>
          {children}
        </ThematicBreak>
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
    case ElementType.Image:
      return (
        <Image element={element} attributes={attributes}>
          {children}
        </Image>
      );
    default:
      return (
        <p className={verticalSpacing} {...attributes}>
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
  const selected = useSelected();
  const focused = useFocused();
  const className = `p-0.25 rounded text-primary-600 cursor-pointer select-none bg-gray-100 hover:bg-gray-200 active:bg-gray-300 ${
    selected && focused ? 'bg-blue-100' : ''
  }`;

  return (
    <Tippy
      content={element.noteTitle}
      duration={0}
      placement="bottom"
      arrow={false}
      offset={[0, 6]}
    >
      {isPageStackingOn ? (
        <span
          className={className}
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
              className={className}
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
    <Tippy
      content={element.url}
      duration={0}
      placement="bottom"
      arrow={false}
      offset={[0, 6]}
    >
      <a
        className="link"
        href={element.url}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(element.url, '_blank', 'noopener noreferrer');
        }}
        {...attributes}
      >
        {children}
      </a>
    </Tippy>
  );
};

type ThematicBreakProps = {
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

const ThematicBreak = (props: ThematicBreakProps) => {
  const { children, attributes, className } = props;
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div
      className={`border-t-2 ${className} ${
        selected && focused ? 'border-blue-100' : ''
      }`}
      {...attributes}
    >
      {children}
    </div>
  );
};

type ImageProps = {
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  element: ImageType;
};

const Image = (props: ImageProps) => {
  const { children, attributes, element } = props;
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={element.url}
        className={`select-none mx-auto max-w-full max-h-full ${
          selected && focused ? 'ring ring-blue-100' : ''
        }`}
        contentEditable={false}
        alt={element.caption}
      />
      {children}
    </div>
  );
};
