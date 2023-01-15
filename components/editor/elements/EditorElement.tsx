import { RenderElementProps } from 'slate-react';
import { ElementType } from 'types/slate';
import ParagraphElement from './ParagraphElement';
import BlockRefElement from './BlockRefElement';
import ImageElement from './ImageElement';
import ThematicBreakElement from './ThematicBreakElement';
import ExternalLinkElement from './ExternalLinkElement';
import NoteLinkElement from './NoteLinkElement';
import CheckListItemElement from './CheckListItemElement';
import TagElement from './TagElement';

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
        <li className={className} {...attributes}>
          {children}
        </li>
      );
    case ElementType.BulletedList:
      return (
        <ul className={`ml-6 list-disc ${className}`} {...attributes}>
          {children}
        </ul>
      );
    case ElementType.NumberedList:
      return (
        <ol className={`ml-6 list-decimal ${className}`} {...attributes}>
          {children}
        </ol>
      );
    case ElementType.CheckListItem:
      return (
        <CheckListItemElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </CheckListItemElement>
      );
    case ElementType.Blockquote:
      return (
        <blockquote className={`border-l-4 pl-4 ${className}`} {...attributes}>
          {children}
        </blockquote>
      );
    case ElementType.CodeBlock:
      return (
        <code
          className={`block rounded border border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800 ${className}`}
          {...attributes}
        >
          {children}
        </code>
      );
    case ElementType.ThematicBreak:
      return (
        <ThematicBreakElement className={className} attributes={attributes}>
          {children}
        </ThematicBreakElement>
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
    case ElementType.Tag:
      return (
        <TagElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </TagElement>
      );
    case ElementType.Image:
      return (
        <ImageElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </ImageElement>
      );
    case ElementType.BlockReference:
      return (
        <BlockRefElement
          className={className}
          element={element}
          attributes={attributes}
        >
          {children}
        </BlockRefElement>
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
