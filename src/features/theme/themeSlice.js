import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  colorScheme: 'blue',
  fontSize: 'medium',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setColorScheme: (state, action) => {
      state.colorScheme = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    updateThemeSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setTheme, setColorScheme, setFontSize, updateThemeSettings } = themeSlice.actions;

export const selectTheme = (state) => state.theme.theme;
export const selectColorScheme = (state) => state.theme.colorScheme;
export const selectFontSize = (state) => state.theme.fontSize;
export const selectThemeSettings = (state) => state.theme;

export default themeSlice.reducer; 