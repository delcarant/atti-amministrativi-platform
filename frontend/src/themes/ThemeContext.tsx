import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme } from './theme.types';
import { temaDefault } from './default';
import { temaRoma } from './comuni';

/** Mappa dei temi disponibili, indicizzata per clientCode */
const TEMI_DISPONIBILI: Record<string, AppTheme> = {
  default: temaDefault,
  roma: temaRoma,
};

/** Struttura del contesto tema */
export interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (tema: AppTheme) => void;
}

/** Contesto React per il tema dell'applicazione */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: temaDefault,
  setTheme: () => undefined,
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider del tema — avvolge l'intera applicazione.
 * Legge la variabile d'ambiente REACT_APP_THEME_CLIENT per selezionare il tema.
 * Esempio: REACT_APP_THEME_CLIENT=roma → carica temaRoma.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const clientCode = process.env.REACT_APP_THEME_CLIENT ?? 'default';
  const temaIniziale = TEMI_DISPONIBILI[clientCode] ?? temaDefault;

  const [theme, setTheme] = useState<AppTheme>(temaIniziale);

  // Applica le variabili CSS del tema al :root e la classe tema al body
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--colore-primario', theme.colorePrimario);
    root.style.setProperty('--colore-secondario', theme.coloreSecondario);
    root.style.setProperty('--colore-accento', theme.coloreAccento);
    root.style.setProperty('--colore-sfondo', theme.coloreSfondo);
    root.style.setProperty('--colore-testo', theme.coloreTesto);
    root.style.setProperty('--colore-header', theme.coloreHeader);
    root.style.setProperty('--colore-header-testo', theme.coloreHeaderTesto);
    root.style.setProperty('--colore-footer', theme.coloreFooter);
    if (theme.fontFamily) {
      root.style.setProperty('--font-family', theme.fontFamily);
    }

    // Rimuove le classi tema precedenti e applica quella nuova
    document.body.classList.forEach((cls) => {
      if (cls.startsWith('tema-')) {
        document.body.classList.remove(cls);
      }
    });
    document.body.classList.add(`tema-${theme.clientCode}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
