import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginFormData, SignupFormData } from '../../types/auth';
import * as authApi from '../../lib/api/authApi';
import { setAccessToken as setAxiosToken } from '../../lib/api/axios';

function setSessionCookie(): void {
  if (typeof window !== 'undefined') {
    document.cookie = 'sv_session=1; path=/; max-age=2592000; samesite=lax';
  }
}

function clearSessionCookie(): void {
  if (typeof window !== 'undefined') {
    document.cookie = 'sv_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionLoading: true,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(data);
      setAxiosToken(response.accessToken);
      setSessionCookie();
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
      setAxiosToken(response.accessToken);
      setSessionCookie();
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
      return await authApi.getProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState() as { auth: AuthState };
      return !auth.isLoading;
    },
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshSession();
      setAxiosToken(response.accessToken);
      setSessionCookie();
      return response;
    } catch (error: any) {
      const status = error.response?.status;
      const definitive = status === 401;
      return rejectWithValue({ definitive, message: definitive ? 'Session expired' : 'Network error' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    authApi.logoutApi().catch(() => {});
    setAxiosToken(null);
    clearSessionCookie();
    dispatch(logout());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isSessionLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOAuthSession: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isSessionLoading = false;
      state.error = null;
    },
    applyRefreshedToken: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user as User;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isSessionLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isSessionLoading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isSessionLoading = false;
        state.error = null;
      })
      .addCase(refreshSession.rejected, (state, action) => {
        const payload = action.payload as { definitive: boolean } | undefined;
        state.isSessionLoading = false;
        if (payload?.definitive) {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
          clearSessionCookie();
        }
      });
  },
});

export const { logout, clearError, setOAuthSession, applyRefreshedToken } = authSlice.actions;
export default authSlice.reducer;
