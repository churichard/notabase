import { Descendant } from 'slate';

export type User = {
  id: string;
};

export type Note = {
  id: string;
  user_id: User['id'];
  content: Descendant[];
  title: string;
};

type PickPartial<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
  Partial<Pick<T, K>>;

export type PartialNoteWithRequiredId = PickPartial<
  Note,
  'user_id' | 'content' | 'title'
>;
