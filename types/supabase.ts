export type User = {
  id: number;
};

export type Note = {
  id: number;
  user_id: number;
  content: string;
  title: string;
};
