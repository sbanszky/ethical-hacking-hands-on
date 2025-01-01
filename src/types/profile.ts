export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  role: string;
  email: string | null;
}