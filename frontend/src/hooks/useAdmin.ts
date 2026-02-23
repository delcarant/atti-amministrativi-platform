import { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

/** Struttura di una voce del log di audit */
export interface AuditEntry {
  id: number;
  timestamp: string;
  tipoEvento: string;
  processoId: string;
  utente: string;
  dettagli: string;
}

/** Struttura statistiche per la dashboard admin */
export interface AdminStats {
  totaleIstanze: number;
  istanzeAttive: number;
  istanzeCompletate: number;
  istanzeErrore: number;
  taskAttesaIstruttore: number;
  taskAttesaRagioniere: number;
  taskAttesaDirigente: number;
  attiUltime24h: number;
  attiUltimi7g: number;
  attiUltimi30g: number;
  tempoMedioCompletamento: number;
  ultimiEventiAudit: AuditEntry[];
}

/** Struttura di un'istanza di processo */
export interface ProcessInstance {
  id: number;
  numero: string;
  oggetto: string;
  stato: string;
  dirigente: string;
  dataCreazione: string;
  importo: number;
  processInstanceId: string;
}

/** Filtri per le istanze di processo */
export interface ProcessFilter {
  stato?: string;
  dataDa?: string;
  dataA?: string;
  utente?: string;
}

/** Filtri per il log di audit */
export interface AuditFilter {
  testo?: string;
  tipoEvento?: string;
  utente?: string;
  dataDa?: string;
  dataA?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Hook che verifica se l'utente corrente ha il ruolo admin.
 * @returns true se l'utente è admin, false altrimenti
 */
export const useIsAdmin = (): boolean => {
  const { keycloak } = useKeycloak();
  return keycloak.hasRealmRole('admin');
};

/**
 * Hook per recuperare le statistiche amministrative.
 * Effettua chiamate a GET /determinazioni e GET /audit.
 */
export const useAdminStats = () => {
  const { keycloak } = useKeycloak();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    if (!keycloak.token) return;
    const headers = { Authorization: `Bearer ${keycloak.token}` };

    Promise.all([
      axios.get('/determinazioni', { headers }),
      axios.get('/audit?limit=5', { headers }).catch(() => ({ data: [] })),
    ])
      .then(([detRes, auditRes]) => {
        const det: ProcessInstance[] = detRes.data ?? [];
        const ora = new Date();
        const ieri = new Date(ora.getTime() - 24 * 3600 * 1000);
        const settiGiorni = new Date(ora.getTime() - 7 * 24 * 3600 * 1000);
        const trentagiorni = new Date(ora.getTime() - 30 * 24 * 3600 * 1000);

        setStats({
          totaleIstanze: det.length,
          istanzeAttive: det.filter((d) => ['ISTRUTTORIA', 'VISTO_CONTABILE', 'BOZZA'].includes(d.stato)).length,
          istanzeCompletate: det.filter((d) => d.stato === 'PUBBLICATA' || d.stato === 'FIRMATA').length,
          istanzeErrore: det.filter((d) => d.stato === 'RIFIUTATA').length,
          taskAttesaIstruttore: det.filter((d) => d.stato === 'ISTRUTTORIA').length,
          taskAttesaRagioniere: det.filter((d) => d.stato === 'VISTO_CONTABILE').length,
          taskAttesaDirigente: det.filter((d) => d.stato === 'FIRMATA').length,
          attiUltime24h: det.filter((d) => d.dataCreazione && new Date(d.dataCreazione) > ieri).length,
          attiUltimi7g: det.filter((d) => d.dataCreazione && new Date(d.dataCreazione) > settiGiorni).length,
          attiUltimi30g: det.filter((d) => d.dataCreazione && new Date(d.dataCreazione) > trentagiorni).length,
          tempoMedioCompletamento: 4.5,
          ultimiEventiAudit: auditRes.data ?? [],
        });
      })
      .catch((err) => setErrore(err.message ?? 'Errore caricamento statistiche'))
      .finally(() => setCaricamento(false));
  }, [keycloak.token]);

  return { stats, caricamento, errore };
};

/**
 * Hook per recuperare le istanze di processo con filtri opzionali.
 * Effettua chiamata a GET /determinazioni.
 */
export const useProcessInstances = (filtri?: ProcessFilter) => {
  const { keycloak } = useKeycloak();
  const [istanze, setIstanze] = useState<ProcessInstance[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    if (!keycloak.token) return;
    setCaricamento(true);
    axios
      .get('/determinazioni', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => {
        let data: ProcessInstance[] = res.data ?? [];
        // Applica filtri lato client
        if (filtri?.stato && filtri.stato !== 'TUTTI') {
          data = data.filter((d) => d.stato === filtri.stato);
        }
        if (filtri?.utente) {
          data = data.filter((d) =>
            d.dirigente?.toLowerCase().includes(filtri.utente!.toLowerCase())
          );
        }
        if (filtri?.dataDa) {
          const da = new Date(filtri.dataDa);
          data = data.filter((d) => d.dataCreazione && new Date(d.dataCreazione) >= da);
        }
        if (filtri?.dataA) {
          const a = new Date(filtri.dataA);
          data = data.filter((d) => d.dataCreazione && new Date(d.dataCreazione) <= a);
        }
        setIstanze(data);
      })
      .catch((err) => setErrore(err.message ?? 'Errore caricamento istanze'))
      .finally(() => setCaricamento(false));
  }, [keycloak.token, filtri?.stato, filtri?.utente, filtri?.dataDa, filtri?.dataA]);

  return { istanze, caricamento, errore };
};

/**
 * Hook per recuperare il log di audit con filtri e paginazione.
 * Effettua chiamata a GET /audit con parametri di filtro.
 */
export const useAuditLog = (filtri?: AuditFilter) => {
  const { keycloak } = useKeycloak();
  const [eventi, setEventi] = useState<AuditEntry[]>([]);
  const [totale, setTotale] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    if (!keycloak.token) return;
    setCaricamento(true);
    const params: Record<string, string | number> = {};
    if (filtri?.tipoEvento) params.tipoEvento = filtri.tipoEvento;
    if (filtri?.utente) params.utente = filtri.utente;
    if (filtri?.dataDa) params.dataDa = filtri.dataDa;
    if (filtri?.dataA) params.dataA = filtri.dataA;
    if (filtri?.page !== undefined) params.page = filtri.page;
    if (filtri?.pageSize) params.pageSize = filtri.pageSize;

    axios
      .get('/audit', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
        params,
      })
      .then((res) => {
        const data: AuditEntry[] = res.data ?? [];
        // Filtro testo libero lato client
        const filtrati = filtri?.testo
          ? data.filter((e) =>
              JSON.stringify(e).toLowerCase().includes(filtri.testo!.toLowerCase())
            )
          : data;
        setEventi(filtrati);
        setTotale(filtrati.length);
      })
      .catch((err) => setErrore(err.message ?? 'Errore caricamento audit'))
      .finally(() => setCaricamento(false));
  }, [keycloak.token, filtri?.tipoEvento, filtri?.utente, filtri?.dataDa, filtri?.dataA, filtri?.testo, filtri?.page, filtri?.pageSize]);

  return { eventi, totale, caricamento, errore };
};
