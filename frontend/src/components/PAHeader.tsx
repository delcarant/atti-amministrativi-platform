import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Button,
  Collapse,
  Header,
  HeaderBrand,
  HeaderContent,
  HeaderRightZone,
  Headers,
  HeaderToggler,
  Icon,
  Nav,
  NavItem,
  NavLink as DrkNavLink,
} from 'design-react-kit';
import { useKeycloak } from '@react-keycloak/web';
import { useTheme } from '../themes/useTheme';

/** Header istituzionale conforme alle linee guida PA */
const PAHeader: React.FC = () => {
  const { theme } = useTheme();
  const { keycloak } = useKeycloak();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isAdmin = keycloak.authenticated && keycloak.hasRealmRole('admin');
  const username = keycloak.tokenParsed?.preferred_username;

  /** Logout tramite Keycloak */
  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <Headers shadow sticky>
      {/* Slim header — striscia superiore con nome ente e link accessibilità */}
      <Header type="slim" theme="dark" style={{ backgroundColor: theme.coloreHeader }}>
        <HeaderContent>
          <HeaderBrand href={theme.sitoWeb ?? '#'} target="_blank" rel="noreferrer">
            {theme.denominazioneEnte}
          </HeaderBrand>
          <HeaderRightZone>
            {keycloak.authenticated ? (
              <span className="text-white me-3 small">
                <Icon icon="it-user" size="sm" className="me-1" aria-hidden />
                {username}
              </span>
            ) : null}
            {keycloak.authenticated ? (
              <Button
                color="light"
                outline
                size="sm"
                onClick={handleLogout}
                className="ms-2"
              >
                Esci
              </Button>
            ) : null}
          </HeaderRightZone>
        </HeaderContent>
      </Header>

      {/* Header center — logo + denominazione ente */}
      <Header type="center" theme="light">
        <HeaderContent>
          <HeaderBrand
            iconName={theme.logoUrl}
            iconAlt={theme.logoAlt}
            href="/"
          >
            <span className="d-block fw-bold" style={{ color: theme.colorePrimario }}>
              {theme.denominazioneEnte}
            </span>
            {theme.tagline && (
              <span className="d-block small text-muted">{theme.tagline}</span>
            )}
          </HeaderBrand>
        </HeaderContent>
      </Header>

      {/* Navbar — menu di navigazione principale */}
      <Header type="navbar" theme="dark" style={{ backgroundColor: theme.coloreHeader }}>
        <HeaderContent expand="lg">
          <HeaderToggler
            aria-controls="nav-collapse"
            aria-expanded={isNavOpen}
            aria-label="Mostra/Nascondi la navigazione"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <Icon icon="it-burger" />
          </HeaderToggler>
          <Collapse
            isOpen={isNavOpen}
            navbar
            header
            id="nav-collapse"
          >
            <Nav navbar>
              <NavItem>
                <DrkNavLink
                  tag={NavLink}
                  to="/"
                  end
                  className="text-white"
                  active={location.pathname === '/'}
                >
                  <Icon icon="it-chart-line" size="sm" className="me-1" aria-hidden />
                  Dashboard
                </DrkNavLink>
              </NavItem>
              <NavItem>
                <DrkNavLink
                  tag={NavLink}
                  to="/atti"
                  className="text-white"
                  active={location.pathname.startsWith('/atti')}
                >
                  <Icon icon="it-folder" size="sm" className="me-1" aria-hidden />
                  Atti
                </DrkNavLink>
              </NavItem>
              <NavItem>
                <DrkNavLink
                  tag={NavLink}
                  to="/tasks"
                  className="text-white"
                  active={location.pathname.startsWith('/tasks')}
                >
                  <Icon icon="it-check-circle" size="sm" className="me-1" aria-hidden />
                  Task Inbox
                </DrkNavLink>
              </NavItem>
              <NavItem>
                <DrkNavLink
                  href="http://localhost:9090"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white"
                >
                  <Icon icon="it-pencil" size="sm" className="me-1" aria-hidden />
                  Editor KIE
                </DrkNavLink>
              </NavItem>
              {/* Voci admin — visibili solo agli utenti con ruolo admin */}
              {isAdmin && (
                <NavItem>
                  <DrkNavLink
                    tag={NavLink}
                    to="/admin"
                    className="text-white"
                    active={location.pathname.startsWith('/admin')}
                  >
                    <Icon icon="it-settings" size="sm" className="me-1" aria-hidden />
                    Amministrazione
                  </DrkNavLink>
                </NavItem>
              )}
            </Nav>
          </Collapse>
        </HeaderContent>
      </Header>
    </Headers>
  );
};

export default PAHeader;
