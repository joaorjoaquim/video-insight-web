import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginFormData, SignupFormData } from '../../types/auth';
import * as authApi from '../../lib/api/authApi';

// Helper function to safely set cookies only on client side
const setAuthCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `auth_token=${token}; path=/; max-age=${15 * 24 * 60 * 60}; samesite=lax`;
  }
};

// Helper function to safely clear cookies only on client side
const clearAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(data);
      localStorage.setItem('auth_token', response.token);
      setAuthCookie(response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (data: SignupFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(data);
      localStorage.setItem('auth_token', response.token);
      setAuthCookie(response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      clearAuthCookie();
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthDialogState: (state, action: PayloadAction<{ isOpen: boolean; mode?: 'login' | 'signup' }>) => {
      // This will be handled by a separate dialog slice
    },
    // New action for OAuth authentication
    setOAuthSession: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('auth_token', action.payload.token);
      setAuthCookie(action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setOAuthSession } = authSlice.actions;
export default authSlice.reducer; 