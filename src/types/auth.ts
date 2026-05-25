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
  githubUsername?: string | null;
  githubStarClaimedWeb?: boolean;
  githubForkClaimedWeb?: boolean;
  githubStarClaimedApi?: boolean;
  githubForkClaimedApi?: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionLoading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  referralCode?: string;
}

export interface AuthDialogState {
  isOpen: boolean;
  mode: "login" | "signup";
}
