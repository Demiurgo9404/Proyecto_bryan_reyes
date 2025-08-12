import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateSystemTheme, setTheme } from '../store/slices/themeSlice';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, resolvedTheme } = useSelector((state: RootState) => state.theme);

  // Efecto para manejar cambios en la preferencia de tema del sistema
  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      dispatch(updateSystemTheme());
    };

    // Configurar el listener para cambios en la preferencia de tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Inicializar el tema
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    } else if (mediaQuery.matches) {
      // Si no hay tema guardado y el sistema prefiere oscuro
      dispatch(setTheme('system'));
    }

    // Aplicar la clase inicial al elemento raíz
    const root = window.document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Limpiar el listener al desmontar
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch, resolvedTheme]);

  // Renderizar solo los hijos, sin un div contenedor adicional
  return <>{children}</>;
};

export default ThemeProvider;
