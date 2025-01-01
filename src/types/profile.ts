export interface Profile {
  id: string;
  username: string | null;
  role: string;
  user: {
    email: string;
  } | null;
}