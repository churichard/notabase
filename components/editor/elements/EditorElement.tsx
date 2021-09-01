import { ReactNode, useCallback, useMemo } from 'react';
import { Node } from 'slate';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import Link from 'next/link';
import type {
  BlockReference,
  ExternalLink,
  Image as ImageType,
  NoteLink,
} from 'types/slate';
import { ElementType } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import useBlockReference from 'editor/backlinks/useBlockReference';
import { ReadOnlyEditor } from '../ReadOnlyEditor';
import EditorLeaf from './EditorLeaf';
import ParagraphElement from './ParagraphElement';

export type EditorElementProps = {
  className?: string;
  attributes: { contentEditable?: boolean };
} & RenderElementProps;

export default function EditorElement(props: EditorElementProps) {
  const { className = '', attributes, children, element } = props;

  switch (element.type) {
    case ElementType.HeadingOne:
      return (
        <h1 className={`text-2xl font-semibold ${className}`} {...attributes}>
          {children}
        </h1>
      );
    case ElementType.HeadingTwo:
      return (
        <h2 className={`text-xl font-semibold ${className}`} {...attributes}>
          {children}
        </h2>
      );
    case ElementType.HeadingThree:
      return (
        <h3 className={`text-lg font-semibold ${className}`} {...attributes}>
          {children}
        </h3>
      );
    case ElementType.ListItem:
      return (
        <li className={`pl-1 ${className}`} {...attributes}>
          {children}
        </li>
      );
    case ElementType.BulletedList:
      return (
        <ul className={`ml-8 list-disc ${className}`} {...attributes}>
          {children}
        </ul>
      );
    case ElementType.NumberedList:
      return (
        <ol className={`ml-8 list-decimal ${className}`} {...attributes}>
          {children}
        </ol>
      );
    case ElementType.Blockquote:
      return (
        <blockquote className={`pl-4 border-l-4 ${className}`} {...attributes}>
          {children}
        </blockquote>
      );
    case ElementType.CodeBlock:
      return (
        <code
          className={`block p-2 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700 ${className}`}
          {...attributes}
        >
          {children}
        </code>
      );
    case ElementType.ThematicBreak:
      return (
        <ThematicBreak className={className} attributes={attributes}>
          {children}
        </ThematicBreak>
      );
    case ElementType.ExternalLink:
      return (
        <ExternalLinkElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </ExternalLinkElement>
      );
    case ElementType.NoteLink:
      return (
        <NoteLinkElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </NoteLinkElement>
      );
    case ElementType.Image:
      return (
        <Image className={className} element={element} attributes={attributes}>
          {children}
        </Image>
      );
    case ElementType.BlockReference:
      return (
        <BlockRef
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </BlockRef>
      );
    default:
      return (
        <ParagraphElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </ParagraphElement>
      );
  }
}

type NoteLinkElementProps = {
  element: NoteLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

const NoteLinkElement = (props: NoteLinkElementProps) => {
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
};

type ExternalLinkElementProps = {
  element: ExternalLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

const ExternalLinkElement = (props: ExternalLinkElementProps) => {
  const { element, children, attributes, className = '' } = props;
  return (
    <Tooltip
      content={<span className="break-words">{element.url}</span>}
      placement="bottom-start"
    >
      <a
        className={`link ${className}`}
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
    </Tooltip>
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
    <div className={`py-2 ${className}`} {...attributes}>
      <div
        className={`py-0.25 ${
          selected && focused
            ? 'bg-primary-100 dark:bg-primary-900'
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

type ImageProps = {
  element: ImageType;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

const Image = (props: ImageProps) => {
  const { children, attributes, element, className = '' } = props;
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div className={className} {...attributes}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={element.url}
        className={`select-none mx-auto max-w-full max-h-full ${
          selected && focused
            ? 'ring ring-primary-100 dark:ring-primary-900'
            : ''
        }`}
        contentEditable={false}
        alt={element.caption}
      />
      {children}
    </div>
  );
};

type BlockRefProps = {
  element: BlockReference;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

const BlockRef = (props: BlockRefProps) => {
  const { className = '', element, children, attributes } = props;
  const selected = useSelected();
  const focused = useFocused();

  const blockReference = useBlockReference(element.blockId);
  const onBlockRefClick = useOnNoteLinkClick();

  const blockRefClassName = useMemo(
    () =>
      `p-0.25 border-b border-gray-200 select-none cursor-alias hover:bg-primary-50 active:bg-primary-100 dark:border-gray-700 dark:hover:bg-primary-900 dark:active:bg-primary-800 ${className} ${
        selected && focused ? 'bg-primary-100 dark:bg-primary-900' : ''
      }`,
    [className, selected, focused]
  );

  const noteTitle = useStore((state) =>
    blockReference ? state.notes[blockReference.noteId].title : null
  );

  const renderElement = useCallback((props: EditorElementProps) => {
    const elementType = props.element.type;
    if (elementType === ElementType.ListItem) {
      return <ParagraphElement {...props} />;
    } else {
      return <EditorElement {...props} />;
    }
  }, []);

  return (
    <Tooltip content={noteTitle} placement="bottom-start" disabled={!noteTitle}>
      <div
        className={blockRefClassName}
        onClick={(e) => {
          e.stopPropagation();
          if (blockReference) {
            onBlockRefClick(blockReference.noteId, blockReference.path);
          }
        }}
        {...attributes}
      >
        {blockReference ? (
          <ReadOnlyEditor
            value={[blockReference.element]}
            renderElement={renderElement}
            renderLeaf={EditorLeaf}
          />
        ) : (
          <BlockRefError element={element} />
        )}
        {children}
      </div>
    </Tooltip>
  );
};

type BlockRefErrorProps = {
  element: BlockReference;
};

const BlockRefError = (props: BlockRefErrorProps) => {
  const { element } = props;
  return (
    <div className="font-medium text-red-500" contentEditable={false}>
      <div>
        Error: no block with id &ldquo;{element.blockId}
        &rdquo;.
      </div>
      <div>Last saved content: {Node.string(element)}</div>
    </div>
  );
};
