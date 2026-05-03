export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  roles?: string[];
  umkm?: {
    id: number;
    name: string;
    owner_name: string;
    [key: string]: any;
  } | null;
  [key: string]: any;
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
