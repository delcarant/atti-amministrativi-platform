import Keycloak from 'keycloak-js';

/**
 * Istanza Keycloak configurata per il realm atti-amministrativi.
 * Utilizzata per l'autenticazione OIDC nell'applicazione frontend.
 */
const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'atti-amministrativi',
  clientId: 'frontend',
});

export default keycloak;
