export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  provider?: string;
  providerId?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
}

export interface AuthDialogState {
  isOpen: boolean;
  mode: "login" | "signup";
}
