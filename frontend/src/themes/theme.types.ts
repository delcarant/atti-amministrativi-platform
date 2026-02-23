/** Interfaccia TypeScript per il tema dell'applicazione */
export interface AppTheme {
  // Identità
  clientName: string;           // es. "Comune di Roma"
  clientCode: string;           // es. "roma" (usato nei CSS class names)

  // Logo
  logoUrl: string;              // URL o path del logo dell'ente
  logoAlt: string;              // Testo alternativo del logo
  faviconUrl?: string;          // URL del favicon

  // Colori principali (CSS custom properties)
  colorePrimario: string;       // es. "#8B0000" (rosso Roma)
  coloreSecondario: string;     // es. "#FFD700" (oro Roma)
  coloreAccento: string;        // es. "#C41E3A"
  coloreSfondo: string;         // es. "#FFFFFF"
  coloreTesto: string;          // es. "#1A1A1A"
  coloreHeader: string;         // es. "#8B0000"
  coloreHeaderTesto: string;    // es. "#FFFFFF"
  coloreFooter: string;         // es. "#333333"

  // Tipografia
  fontFamily?: string;          // es. "Titillium Web, sans-serif" (font PA italiana)

  // Dati istituzionali (per header/footer)
  denominazioneEnte: string;    // es. "Roma Capitale"
  tipoEnte: string;             // es. "Comune"
  sitoWeb?: string;             // es. "https://www.comune.roma.it"
  pec?: string;                 // PEC dell'ente
  cf?: string;                  // Codice fiscale ente
  indirizzo?: string;           // Indirizzo sede
  tagline?: string;             // es. "Servizi digitali per i cittadini"
}
