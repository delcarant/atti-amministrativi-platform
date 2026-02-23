import { AppTheme } from '../theme.types';

/** Tema predefinito per il Comune di Roma */
export const temaRoma: AppTheme = {
  clientName: 'Roma Capitale',
  clientCode: 'roma',
  logoUrl: '/assets/loghi/roma-capitale.svg',
  logoAlt: 'Roma Capitale - Stemma del Comune di Roma',
  faviconUrl: '/assets/loghi/roma-favicon.ico',

  colorePrimario: '#8B0000',       // Rosso carminio (colore ufficiale Roma Capitale)
  coloreSecondario: '#C41E3A',     // Rosso scuro
  coloreAccento: '#FFD700',        // Oro (secondo colore ufficiale)
  coloreSfondo: '#FFFFFF',
  coloreTesto: '#1A1A1A',
  coloreHeader: '#8B0000',
  coloreHeaderTesto: '#FFFFFF',
  coloreFooter: '#2C2C2C',

  fontFamily: "'Titillium Web', sans-serif",

  denominazioneEnte: 'Roma Capitale',
  tipoEnte: 'Comune',
  sitoWeb: 'https://www.comune.roma.it',
  pec: 'protocollo.generale@pec.comune.roma.it',
  cf: '02438750586',
  indirizzo: 'Piazza del Campidoglio, 1 - 00186 Roma',
  tagline: 'Servizi digitali per i cittadini di Roma',
};
