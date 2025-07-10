import api from './axios';

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
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Signup
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

// Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Get user profile
export const getProfile = async (): Promise<User> => {
  const response = await api.get('/user/profile');
  return response.data;
};

// OAuth redirect URLs
export const getOAuthUrl = (provider: 'google' | 'discord'): string => {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/auth/oauth/${provider}`;
}; 