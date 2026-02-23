import React, { ReactNode, ReactElement } from 'react';

/** Proprietà del componente Layout */
interface LayoutProps {
  children: ReactNode;
  header: ReactElement;
  sidebar: ReactElement;
  isAdmin?: boolean;
}

/**
 * Componente Layout legacy — mantenuto per compatibilità.
 * Il layout principale dell'applicazione è ora PALayout.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default Layout;
