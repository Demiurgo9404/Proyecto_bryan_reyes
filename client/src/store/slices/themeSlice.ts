import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

// Función para detectar el tema del sistema
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Función para obtener el tema guardado en localStorage o usar el predeterminado
const getInitialTheme = (): ThemeState => {
  if (typeof window === 'undefined') {
    return {
      mode: 'system',
      systemTheme: 'light',
      resolvedTheme: 'light',
    };
  }

  const savedMode = localStorage.getItem('theme') as ThemeMode | null;
  const systemTheme = getSystemTheme();
  
  return {
    mode: savedMode || 'system',
    systemTheme,
    resolvedTheme: savedMode === 'system' ? systemTheme : (savedMode as 'light' | 'dark') || 'light',
  };
};

const initialState: ThemeState = getInitialTheme();

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      const newMode = action.payload;
      state.mode = newMode;
      
      // Actualizar el tema resuelto
      if (newMode === 'system') {
        state.resolvedTheme = state.systemTheme;
      } else {
        state.resolvedTheme = newMode;
      }

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newMode);
        
        // Aplicar la clase al elemento raíz
        const root = window.document.documentElement;
        if (state.resolvedTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    },
    updateSystemTheme: (state) => {
      const newSystemTheme = getSystemTheme();
      state.systemTheme = newSystemTheme;
      
      // Actualizar el tema resuelto solo si el modo es 'system'
      if (state.mode === 'system') {
        state.resolvedTheme = newSystemTheme;
        
        // Aplicar la clase al elemento raíz
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          if (newSystemTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      }
    },
    toggleTheme: (state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = newMode;
      state.resolvedTheme = newMode;

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newMode);
        
        // Aplicar la clase al elemento raíz
        const root = window.document.documentElement;
        if (newMode === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    },
  },
});

export const { setTheme, updateSystemTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
