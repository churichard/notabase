export type User = {
  id: string;
};

export type Note = {
  id: string;
  user_id: string;
  content: string;
  title: string;
};
