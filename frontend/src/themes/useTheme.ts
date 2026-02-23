import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from './ThemeContext';

/**
 * Custom hook per accedere al tema corrente dell'applicazione.
 * Restituisce il tema corrente e una funzione setTheme per cambiarlo a runtime.
 */
export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
