export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'user' | 'admin';
};
