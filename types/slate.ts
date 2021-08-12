import type { BaseEditor, Descendant } from 'slate';
import type { ReactEditor } from 'slate-react';
import type { HistoryEditor } from 'slate-history';

export type NotabaseEditor = BaseEditor & ReactEditor & HistoryEditor;

export enum ElementType {
  Paragraph = 'paragraph',
  HeadingOne = 'heading-one',
  HeadingTwo = 'heading-two',
  HeadingThree = 'heading-three',
  ListItem = 'list-item',
  BulletedList = 'bulleted-list',
  NumberedList = 'numbered-list',
  Blockquote = 'block-quote',
  ExternalLink = 'link',
  NoteLink = 'note-link',
  CodeBlock = 'code-block',
  ThematicBreak = 'thematic-break',
  Image = 'image',
  BlockReference = 'block-reference',
}

export enum Mark {
  Bold = 'bold',
  Italic = 'italic',
  Code = 'code',
  Underline = 'underline',
  Strikethrough = 'strikethrough',
}

export type ParagraphElement = {
  id?: string;
  type: ElementType.Paragraph;
  children: Descendant[];
};

export type HeadingOneElement = {
  id?: string;
  type: ElementType.HeadingOne;
  children: Descendant[];
};

export type HeadingTwoElement = {
  id?: string;
  type: ElementType.HeadingTwo;
  children: Descendant[];
};

export type HeadingThreeElement = {
  id?: string;
  type: ElementType.HeadingThree;
  children: Descendant[];
};

export type ListItem = {
  id?: string;
  type: ElementType.ListItem;
  children: Descendant[];
};

export type BulletedList = {
  type: ElementType.BulletedList;
  children: Descendant[];
};

export type NumberedList = {
  type: ElementType.NumberedList;
  children: Descendant[];
};

export type Blockquote = {
  id?: string;
  type: ElementType.Blockquote;
  children: Descendant[];
};

export type ExternalLink = {
  type: ElementType.ExternalLink;
  url: string;
  children: Descendant[];
};

export type NoteLink = {
  type: ElementType.NoteLink;
  noteId: string;
  noteTitle: string;
  customText?: string;
  children: Descendant[];
};

export type CodeBlock = {
  id?: string;
  type: ElementType.CodeBlock;
  children: Descendant[];
};

export type ThematicBreak = {
  id?: string;
  type: ElementType.ThematicBreak;
  children: Descendant[];
};

export type Image = {
  id?: string;
  type: ElementType.Image;
  url: string;
  caption?: string;
  children: Descendant[];
};

export type BlockReference = {
  id?: string;
  type: ElementType.BlockReference;
  blockId: string;
  children: FormattedText[];
};

export type NotabaseElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | ListItem
  | BulletedList
  | NumberedList
  | Blockquote
  | ExternalLink
  | NoteLink
  | CodeBlock
  | ThematicBreak
  | Image
  | BlockReference;

export type ListElement = BulletedList | NumberedList;

export type FormattedText = { text: string } & Partial<Record<Mark, boolean>>;

export type NotabaseText = FormattedText;

declare module 'slate' {
  interface CustomTypes {
    Editor: NotabaseEditor;
    Element: NotabaseElement;
    Text: NotabaseText;
  }
}
