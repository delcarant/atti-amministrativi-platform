import React, { ReactNode } from 'react';
import { Skiplink, SkiplinkItem } from 'design-react-kit';
import PAHeader from './PAHeader';
import PAFooter from './PAFooter';

interface PALayoutProps {
  children: ReactNode;
}

/**
 * Layout principale dell'applicazione.
 * Include PAHeader, il contenuto principale e PAFooter.
 * Gestisce il SkipLink per l'accessibilità (WCAG 2.1 AA).
 */
const PALayout: React.FC<PALayoutProps> = ({ children }) => {
  return (
    <>
      {/* Skiplink per l'accessibilità — permette di saltare al contenuto principale */}
      <Skiplink>
        <SkiplinkItem href="#main-content">Vai al contenuto principale</SkiplinkItem>
      </Skiplink>

      <PAHeader />

      <main id="main-content" tabIndex={-1} style={{ minHeight: '60vh' }}>
        {children}
      </main>

      <PAFooter />
    </>
  );
};

export default PALayout;
