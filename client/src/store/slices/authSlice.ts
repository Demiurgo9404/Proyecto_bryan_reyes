import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  bio?: string;
  gender?: string;
  birthDate?: string;
  interests?: string[];
  location?: string;
  matches?: string[];
  nearbyUsers?: string[];
  recentActivity?: any[];
  role: 'user' | 'admin';
  profileComplete?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  gender?: string;
  birthDate?: string;
  interests?: string[];
  location?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    registerSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('token');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    loadUserSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
    },
    clearError(state) {
      state.error = null;
    },
    updateUserProfile(state, action: PayloadAction<UpdateProfileData>) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          profileComplete: true, // Mark profile as complete after update
        };
      }
    },
  },
});

// Export individual actions
export const authRequest = authSlice.actions.authRequest;
export const loginSuccess = authSlice.actions.loginSuccess;
export const registerSuccess = authSlice.actions.registerSuccess;
export const authFailure = authSlice.actions.authFailure;
export const logout = authSlice.actions.logout;
export const loadUserSuccess = authSlice.actions.loadUserSuccess;
export const clearError = authSlice.actions.clearError;
export const updateUserProfile = authSlice.actions.updateUserProfile;

// Export the reducer as default
export default authSlice.reducer;
