import React from 'react';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import {
  Page,
  PageHeader,
  PageSidebar,
  Nav,
  NavItem,
  NavList,
  PageHeaderTools,
  PageHeaderToolsItem,
} from '@patternfly/react-core';
import keycloak from './keycloak';
import Dashboard from './pages/Dashboard';
import AttiList from './pages/AttiList';
import TaskInbox from './pages/TaskInbox';

/**
 * Componente principale dell'applicazione.
 * Configura autenticazione Keycloak, routing e layout PatternFly.
 */
const App: React.FC = () => {
  const navItems = (
    <Nav aria-label="Navigazione principale">
      <NavList>
        <NavItem>
          <NavLink to="/">Dashboard</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/atti">Atti</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/tasks">Task Inbox</NavLink>
        </NavItem>
        <NavItem>
          <a href="http://localhost:9090" target="_blank" rel="noreferrer">
            Editor KIE
          </a>
        </NavItem>
      </NavList>
    </Nav>
  );

  const header = (
    <PageHeader
      logo="🏛️ Atti Amministrativi"
      headerTools={
        <PageHeaderTools>
          <PageHeaderToolsItem>
            {keycloak.authenticated ? `👤 ${keycloak.tokenParsed?.preferred_username}` : 'Non autenticato'}
          </PageHeaderToolsItem>
        </PageHeaderTools>
      }
    />
  );

  const sidebar = <PageSidebar nav={navItems} />;

  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <BrowserRouter>
        <Page header={header} sidebar={sidebar}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/atti" element={<AttiList />} />
            <Route path="/tasks" element={<TaskInbox />} />
          </Routes>
        </Page>
      </BrowserRouter>
    </ReactKeycloakProvider>
  );
};

export default App;
