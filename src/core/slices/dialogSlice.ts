import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthDialogState } from '../../types/auth';

const initialState: AuthDialogState = {
  isOpen: false,
  mode: 'login',
};

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openAuthDialog: (state, action: PayloadAction<'login' | 'signup'>) => {
      state.isOpen = true;
      state.mode = action.payload;
    },
    closeAuthDialog: (state) => {
      state.isOpen = false;
    },
    switchAuthMode: (state, action: PayloadAction<'login' | 'signup'>) => {
      state.mode = action.payload;
    },
  },
});

export const { openAuthDialog, closeAuthDialog, switchAuthMode } = dialogSlice.actions;
export default dialogSlice.reducer; 