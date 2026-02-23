import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Container,
  Nav,
  NavItem,
  NavLink as DrkNavLink,
} from 'design-react-kit';
import { useIsAdmin } from '../../hooks/useAdmin';

/** Voci del menu di navigazione amministrativa */
const VOCI_MENU = [
  { percorso: '/admin', etichetta: 'Dashboard Admin', esatto: true },
  { percorso: '/admin/processi', etichetta: 'Processi' },
  { percorso: '/admin/audit', etichetta: 'Audit Log' },
  { percorso: '/admin/utenti', etichetta: 'Utenti' },
  { percorso: '/admin/regole', etichetta: 'Regole DMN' },
  { percorso: '/admin/metriche', etichetta: 'Metriche' },
];

/**
 * Layout dedicato alla sezione amministrativa.
 * Verifica che l'utente abbia il ruolo 'admin'; in caso contrario mostra
 * una pagina di "Accesso Negato".
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
      <Container className="py-5">
        <Alert color="danger">
          <strong>Accesso Negato</strong> — Non hai i permessi necessari per accedere alla
          Console di Amministrazione. Questa sezione è riservata agli utenti con ruolo{' '}
          <strong>admin</strong>.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Breadcrumb di navigazione */}
      <div className="bg-light border-bottom py-2">
        <Container>
          <Breadcrumb>
            <BreadcrumbItem href="/" tag="a">Home</BreadcrumbItem>
            {segmentiBreadcrumb.map((seg, idx) => (
              <BreadcrumbItem
                key={seg.percorso}
                active={idx === segmentiBreadcrumb.length - 1}
                href={idx < segmentiBreadcrumb.length - 1 ? seg.percorso : undefined}
                tag={idx < segmentiBreadcrumb.length - 1 ? 'a' : 'span'}
              >
                {seg.testo}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </Container>
      </div>

      {/* Corpo principale con navigazione secondaria e contenuto */}
      <div className="d-flex" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Barra di navigazione secondaria verticale */}
        <div
          className="border-end bg-light"
          style={{ width: '220px', flexShrink: 0, paddingTop: '1rem' }}
        >
          <p
            className="px-3 pb-2 mb-0 text-uppercase fw-bold"
            style={{ fontSize: '0.75rem', color: '#6a6e73' }}
          >
            ⚙️ Amministrazione
          </p>
          <Nav vertical>
            {VOCI_MENU.map((voce) => (
              <NavItem key={voce.percorso}>
                <DrkNavLink
                  tag={NavLink}
                  to={voce.percorso}
                  end={voce.esatto}
                  active={
                    voce.esatto
                      ? location.pathname === voce.percorso
                      : location.pathname.startsWith(voce.percorso)
                  }
                  className="px-3 py-2 text-dark text-decoration-none d-block"
                >
                  {voce.etichetta}
                </DrkNavLink>
              </NavItem>
            ))}
          </Nav>
        </div>

        {/* Contenuto della pagina admin corrente */}
        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
