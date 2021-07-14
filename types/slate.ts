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
}

export enum Mark {
  Bold = 'bold',
  Italic = 'italic',
  Code = 'code',
  Underline = 'underline',
  Strikethrough = 'strikethrough',
}

export type ParagraphElement = {
  type: ElementType.Paragraph;
  children: Descendant[];
};

export type HeadingOneElement = {
  type: ElementType.HeadingOne;
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: ElementType.HeadingTwo;
  children: Descendant[];
};

export type HeadingThreeElement = {
  type: ElementType.HeadingThree;
  children: Descendant[];
};

export type ListItem = {
  type: ElementType.ListItem;
  children: Descendant[];
};

export type BulletedList = {
  type: ElementType.BulletedList;
  children: ListItem[];
};

export type NumberedList = {
  type: ElementType.NumberedList;
  children: ListItem[];
};

export type Blockquote = {
  type: ElementType.Blockquote;
  children: Descendant[];
};

export type ExternalLink = {
  type: ElementType.ExternalLink;
  url: string;
  children: FormattedText[];
};

export type NoteLink = {
  type: ElementType.NoteLink;
  noteId: string;
  noteTitle: string;
  customText?: string;
  children: FormattedText[];
};

export type CodeBlock = {
  type: ElementType.CodeBlock;
  children: Descendant[];
};

export type ThematicBreak = {
  type: ElementType.ThematicBreak;
  children: Descendant[];
};

export type Image = {
  type: ElementType.Image;
  url: string;
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
  | Image;

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
