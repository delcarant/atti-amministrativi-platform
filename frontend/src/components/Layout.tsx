import React from 'react';
import { Page } from '@patternfly/react-core';

/** Proprietà del componente Layout */
interface LayoutProps {
  children: React.ReactNode;
  header: React.ReactElement;
  sidebar: React.ReactElement;
  isAdmin?: boolean;
}

/**
 * Componente Layout base per l'applicazione.
 * Utilizza il componente Page di PatternFly per strutturare l'interfaccia.
 * Se isAdmin è true, mostra anche la sezione Amministrazione nella sidebar.
 */
const Layout: React.FC<LayoutProps> = ({ children, header, sidebar }) => {
  return (
    <Page header={header} sidebar={sidebar}>
      {children}
    </Page>
  );
};

export default Layout;
