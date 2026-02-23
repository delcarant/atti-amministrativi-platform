import React from 'react';
import { Page } from '@patternfly/react-core';

/** Proprietà del componente Layout */
interface LayoutProps {
  children: React.ReactNode;
  header: React.ReactElement;
  sidebar: React.ReactElement;
}

/**
 * Componente Layout base per l'applicazione.
 * Utilizza il componente Page di PatternFly per strutturare l'interfaccia.
 */
const Layout: React.FC<LayoutProps> = ({ children, header, sidebar }) => {
  return (
    <Page header={header} sidebar={sidebar}>
      {children}
    </Page>
  );
};

export default Layout;
