import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Nav,
  NavItem,
  NavList,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import { useIsAdmin } from '../../hooks/useAdmin';

/** Voci del menu di navigazione amministrativa */
const VOCI_MENU = [
  { percorso: '/admin', etichetta: '🖥️ Dashboard Admin', esatto: true },
  { percorso: '/admin/processi', etichetta: '🔄 Processi' },
  { percorso: '/admin/audit', etichetta: '📋 Audit Log' },
  { percorso: '/admin/utenti', etichetta: '👥 Utenti' },
  { percorso: '/admin/regole', etichetta: '📐 Regole DMN' },
  { percorso: '/admin/metriche', etichetta: '📈 Metriche' },
];

/**
 * Layout dedicato alla sezione amministrativa.
 * Verifica che l'utente abbia il ruolo 'admin'; in caso contrario mostra
 * una pagina di "Accesso Negato" con EmptyState PatternFly.
 */
const AdminLayout: React.FC = () => {
  const isAdmin = useIsAdmin();
  const location = useLocation();

  // Genera il testo del breadcrumb in base al percorso corrente
  const segmentiBreadcrumb = location.pathname
    .split('/')
    .filter(Boolean)
    .map((seg, idx, arr) => ({
      testo: seg.charAt(0).toUpperCase() + seg.slice(1),
      percorso: '/' + arr.slice(0, idx + 1).join('/'),
    }));

  // Se l'utente non è admin, mostra pagina di accesso negato
  if (!isAdmin) {
    return (
      <PageSection>
        <EmptyState>
          <EmptyStateHeader
            titleText="Accesso Negato"
            icon={<EmptyStateIcon icon={LockIcon} />}
            headingLevel="h2"
          />
          <EmptyStateBody>
            Non hai i permessi necessari per accedere alla Console di Amministrazione.
            Questa sezione è riservata agli utenti con ruolo <strong>admin</strong>.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <>
      {/* Breadcrumb di navigazione */}
      <PageSection variant="light" style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
        <Breadcrumb>
          <BreadcrumbItem to="/">Home</BreadcrumbItem>
          {segmentiBreadcrumb.map((seg, idx) => (
            <BreadcrumbItem
              key={seg.percorso}
              isActive={idx === segmentiBreadcrumb.length - 1}
              to={idx < segmentiBreadcrumb.length - 1 ? seg.percorso : undefined}
            >
              {seg.testo}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </PageSection>

      {/* Corpo principale con navigazione secondaria e contenuto */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
        {/* NavBar secondaria verticale */}
        <div
          style={{
            width: '220px',
            borderRight: '1px solid #d2d2d2',
            backgroundColor: '#fafafa',
            paddingTop: '1rem',
          }}
        >
          <Title
            headingLevel="h3"
            size="md"
            style={{ padding: '0 1rem 0.5rem', color: '#6a6e73', textTransform: 'uppercase', fontSize: '0.75rem' }}
          >
            ⚙️ Amministrazione
          </Title>
          <Nav aria-label="Navigazione Admin" variant="tertiary">
            <NavList>
              {VOCI_MENU.map((voce) => (
                <NavItem
                  key={voce.percorso}
                  isActive={
                    voce.esatto
                      ? location.pathname === voce.percorso
                      : location.pathname.startsWith(voce.percorso)
                  }
                >
                  <NavLink to={voce.percorso} end={voce.esatto}>
                    {voce.etichetta}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>
          </Nav>
        </div>

        {/* Contenuto della pagina admin corrente */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
