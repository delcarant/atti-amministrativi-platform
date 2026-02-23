import React from 'react';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  Nav,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
} from '@patternfly/react-core';
import keycloak from './keycloak';
import Dashboard from './pages/Dashboard';
import AttiList from './pages/AttiList';
import TaskInbox from './pages/TaskInbox';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProcessiAdmin from './pages/admin/ProcessiAdmin';
import AuditLogAdmin from './pages/admin/AuditLogAdmin';
import UtentiAdmin from './pages/admin/UtentiAdmin';
import RegoleDMN from './pages/admin/RegoleDMN';
import MetricheAdmin from './pages/admin/MetricheAdmin';

/**
 * Componente principale dell'applicazione.
 * Configura autenticazione Keycloak, routing e layout PatternFly.
 */
const App: React.FC = () => {
  /** Verifica se l'utente autenticato ha il ruolo admin */
  const isAdmin = keycloak.authenticated && keycloak.hasRealmRole('admin');

  const navItems = (
    <Nav aria-label="Navigazione principale">
      <NavList>
        <NavItem>
          <NavLink to="/">📊 Dashboard</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/atti">📋 Atti</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/tasks">✅ Task Inbox</NavLink>
        </NavItem>
        <NavItem>
          <a href="http://localhost:9090" target="_blank" rel="noreferrer">
            ✏️ Editor KIE
          </a>
        </NavItem>
        {/* Sezione Amministrazione — visibile solo agli utenti con ruolo admin */}
        {isAdmin && (
          <NavGroup title="⚙️ Amministrazione">
            <NavItem>
              <NavLink to="/admin">🖥️ Console Admin</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/processi">🔄 Processi</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/audit">📋 Audit Log</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/utenti">👥 Utenti</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/regole">📐 Regole DMN</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/metriche">📈 Metriche</NavLink>
            </NavItem>
          </NavGroup>
        )}
      </NavList>
    </Nav>
  );

  const header = (
    <Masthead>
      <MastheadMain>
        <MastheadBrand>🏛️ Atti Amministrativi</MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <span>
          {keycloak.authenticated ? `👤 ${keycloak.tokenParsed?.preferred_username}` : 'Non autenticato'}
        </span>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>{navItems}</PageSidebarBody>
    </PageSidebar>
  );

  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <BrowserRouter>
        <Page header={header} sidebar={sidebar}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/atti" element={<AttiList />} />
            <Route path="/tasks" element={<TaskInbox />} />
            {/* Route protette solo per admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="processi" element={<ProcessiAdmin />} />
              <Route path="audit" element={<AuditLogAdmin />} />
              <Route path="utenti" element={<UtentiAdmin />} />
              <Route path="regole" element={<RegoleDMN />} />
              <Route path="metriche" element={<MetricheAdmin />} />
            </Route>
          </Routes>
        </Page>
      </BrowserRouter>
    </ReactKeycloakProvider>
  );
};

export default App;
