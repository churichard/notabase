import { Descendant } from 'slate';
import type { PickPartial } from 'utils/types';

export type User = {
  id: string;
};

export type Note = {
  id: string;
  user_id: User['id'];
  content: Descendant[];
  title: string;
};

export type PartialNoteWithRequiredId = PickPartial<
  Note,
  'user_id' | 'content' | 'title'
>;
