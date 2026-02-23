import React from 'react';
import { Col, Row } from 'design-react-kit';
import { useTheme } from '../themes/useTheme';

/** Footer istituzionale conforme alle linee guida PA */
const PAFooter: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer
      className="it-footer"
      style={{ backgroundColor: theme.coloreFooter, color: '#ffffff' }}
    >
      {/* Sezione principale */}
      <div className="it-footer-main">
        <div className="container">
          <Row>
            {/* Colonna logo e descrizione */}
            <Col lg={3} md={4} className="pb-2">
              <div className="it-brand-wrapper">
                <img
                  src={theme.logoUrl}
                  alt={theme.logoAlt}
                  height="60"
                  className="d-inline-block me-3"
                />
                <div className="it-brand-text">
                  <h2 className="it-brand-title h5 text-white mb-0">
                    {theme.denominazioneEnte}
                  </h2>
                  {theme.tagline && (
                    <div className="it-brand-tagline small" style={{ color: '#cccccc' }}>
                      {theme.tagline}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Colonna link istituzionali */}
            <Col lg={3} md={4} className="pb-2">
              <h3 className="footer-heading h6 text-white text-uppercase mb-3">
                Amministrazione
              </h3>
              <ul className="list-unstyled">
                <li className="mb-1">
                  <a
                    href="/"
                    className="text-white text-decoration-none"
                    style={{ opacity: 0.85 }}
                  >
                    Amministrazione Trasparente
                  </a>
                </li>
                <li className="mb-1">
                  <a
                    href="/"
                    className="text-white text-decoration-none"
                    style={{ opacity: 0.85 }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li className="mb-1">
                  <a
                    href="/"
                    className="text-white text-decoration-none"
                    style={{ opacity: 0.85 }}
                  >
                    Accessibilità
                  </a>
                </li>
                <li className="mb-1">
                  <a
                    href="/"
                    className="text-white text-decoration-none"
                    style={{ opacity: 0.85 }}
                  >
                    Note Legali
                  </a>
                </li>
              </ul>
            </Col>

            {/* Colonna contatti */}
            <Col lg={3} md={4} className="pb-2">
              <h3 className="footer-heading h6 text-white text-uppercase mb-3">
                Contatti
              </h3>
              <ul className="list-unstyled">
                {theme.indirizzo && (
                  <li className="mb-1 small" style={{ color: '#cccccc' }}>
                    {theme.indirizzo}
                  </li>
                )}
                {theme.pec && (
                  <li className="mb-1">
                    <a
                      href={`mailto:${theme.pec}`}
                      className="text-white text-decoration-none small"
                      style={{ opacity: 0.85 }}
                    >
                      PEC: {theme.pec}
                    </a>
                  </li>
                )}
                {theme.sitoWeb && (
                  <li className="mb-1">
                    <a
                      href={theme.sitoWeb}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white text-decoration-none small"
                      style={{ opacity: 0.85 }}
                    >
                      {theme.sitoWeb}
                    </a>
                  </li>
                )}
              </ul>
            </Col>
          </Row>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="it-footer-small-prints"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem 0' }}
      >
        <div className="container">
          <Row className="align-items-center">
            <Col>
              <small style={{ color: '#cccccc' }}>
                © {new Date().getFullYear()} {theme.denominazioneEnte}
                {theme.cf && ` — C.F. ${theme.cf}`}
                {theme.pec && ` — PEC: ${theme.pec}`}
              </small>
            </Col>
          </Row>
        </div>
      </div>
    </footer>
  );
};

export default PAFooter;
