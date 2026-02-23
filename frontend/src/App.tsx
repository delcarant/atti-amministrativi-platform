import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import '@fontsource/titillium-web';
import './themes/themes.css';
import './themes/roma.css';
import keycloak from './keycloak';
import { ThemeProvider } from './themes/ThemeContext';
import PALayout from './components/PALayout';
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
 * Configura il tema, l'autenticazione Keycloak, il layout PA e il routing.
 */
const App: React.FC = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <ThemeProvider>
        <BrowserRouter>
          <PALayout>
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
          </PALayout>
        </BrowserRouter>
      </ThemeProvider>
    </ReactKeycloakProvider>
  );
};

export default App;
