import { AppTheme } from './theme.types';

/** Tema neutro di default quando non è configurato nessun cliente */
export const temaDefault: AppTheme = {
  clientName: 'Ente Pubblico',
  clientCode: 'default',
  colorePrimario: '#0066CC',    // Blu PA (colore Bootstrap Italia)
  coloreSecondario: '#004C99',
  coloreAccento: '#0099CC',
  coloreSfondo: '#FFFFFF',
  coloreTesto: '#1A1A1A',
  coloreHeader: '#0066CC',
  coloreHeaderTesto: '#FFFFFF',
  coloreFooter: '#2C2C2C',
  fontFamily: "'Titillium Web', sans-serif",
  denominazioneEnte: 'Ente Pubblico',
  tipoEnte: 'Comune',
  logoUrl: '/assets/loghi/default-logo.svg',
  logoAlt: 'Logo Ente',
};
