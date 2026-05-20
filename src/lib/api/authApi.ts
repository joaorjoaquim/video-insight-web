import api from "./axios";

export interface SignupData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

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

export interface Video {
  id: number;
  title: string;
  duration: number;
  status: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: "spend" | "purchase" | "refund";
  status: "completed" | "pending" | "failed";
  description: string;
  userId: number;
  createdAt: string;
  referenceId: string;
  referenceType: string;
  tokensUsed: number;
  video?: Video;
}

export interface CreditsResponse {
  credits: number;
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Signup
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

// Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Get user profile
export const getProfile = async (): Promise<User> => {
  const response = await api.get("/user/profile");
  return response.data;
};

// OAuth redirect URLs
export const getOAuthUrl = (provider: "google" | "discord"): string => {
  return `${
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  }/auth/oauth/${provider}`;
};

// Get user credits and transactions
export const getCredits = async (): Promise<CreditsResponse> => {
  const response = await api.get("/credits");
  return response.data;
};

export interface RedeemPromoResponse {
  credits: number;
  coinsAdded: number;
  message: string;
}

export const redeemPromoCode = async (code: string): Promise<RedeemPromoResponse> => {
  const response = await api.post("/credits/redeem", { code: code.trim().toUpperCase() });
  return response.data;
};

export interface ClaimGithubResponse {
  credits: number;
  coinsAdded: number;
  message: string;
}

export const claimGithubCredits = async (
  githubUsername: string,
  action: "star" | "fork"
): Promise<ClaimGithubResponse> => {
  const response = await api.post("/credits/claim/github", { githubUsername, action });
  return response.data;
};

export interface ReferralInfo {
  referralCode: string;
  referralUrl: string;
  referralsCount: number;
  creditsEarned: number;
}

export const getReferralInfo = async (): Promise<ReferralInfo> => {
  const response = await api.get("/user/referral");
  return response.data;
};
