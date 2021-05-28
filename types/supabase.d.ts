import type { Descendant } from 'slate';

export type User = {
  id: string;
};

export type Note = {
  id: string;
  user_id: User['id'];
  content: Descendant[];
  title: string;
};
