import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Progress,
  Row,
  Spinner,
} from 'design-react-kit';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

/** URL del dashboard Grafana embedded */
const GRAFANA_DASHBOARD_URL = 'http://localhost:3001/d/atti-dashboard';

/** Intervallo di auto-refresh in millisecondi */
const REFRESH_INTERVAL_MS = 30000;

/** Struttura metriche JVM */
interface MetricheJVM {
  heapUsato: number;     // MB
  heapTotale: number;    // MB
  cpuUsage: number;      // percentuale 0-100
  threadAttivi: number;
  uptime: number;        // ore
}

/** Struttura statistiche atti */
interface StatisticheAtti {
  pubblicata: number;
  inLavorazione: number;
  rifiutata: number;
  sospesa: number;
}

/**
 * Pagina metriche con visualizzazione JVM, statistiche atti e dashboard Grafana.
 * Si aggiorna automaticamente ogni 30 secondi.
 */
const MetricheAdmin: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [metriche, setMetriche] = useState<MetricheJVM | null>(null);
  const [statistiche, setStatistiche] = useState<StatisticheAtti | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState(new Date());
  const [contatore, setContatore] = useState(REFRESH_INTERVAL_MS / 1000);
  const intervalloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Carica le metriche Quarkus/Prometheus e le determinazioni */
  const caricaMetriche = () => {
    if (!keycloak.token) return;
    setCaricamento(true);

    Promise.all([
      axios.get('/q/metrics', { headers: { Authorization: `Bearer ${keycloak.token}` } }).catch(() => null),
      axios.get('/determinazioni', { headers: { Authorization: `Bearer ${keycloak.token}` } }).catch(() => ({ data: [] })),
    ])
      .then(([metrRes, detRes]) => {
        // Parsing metriche Prometheus (formato testo)
        const testo: string = typeof metrRes?.data === 'string' ? metrRes.data : '';
        const estraiValore = (pattern: RegExp): number => {
          const match = testo.match(pattern);
          return match ? parseFloat(match[1]) : 0;
        };

        setMetriche({
          heapUsato: Math.round(estraiValore(/jvm_memory_used_bytes\{.*heap.*\} ([\d.]+)/) / 1024 / 1024),
          heapTotale: Math.round(estraiValore(/jvm_memory_max_bytes\{.*heap.*\} ([\d.]+)/) / 1024 / 1024),
          cpuUsage: Math.round(estraiValore(/process_cpu_usage ([\d.]+)/) * 100),
          threadAttivi: Math.round(estraiValore(/jvm_threads_live_threads ([\d.]+)/)),
          uptime: Math.round(estraiValore(/process_uptime_seconds ([\d.]+)/) / 3600),
        });

        // Calcola statistiche atti
        const det: Array<{ stato: string }> = detRes?.data ?? [];
        setStatistiche({
          pubblicata: det.filter((d) => d.stato === 'PUBBLICATA').length,
          inLavorazione: det.filter((d) => ['ISTRUTTORIA', 'VISTO_CONTABILE', 'BOZZA'].includes(d.stato)).length,
          rifiutata: det.filter((d) => d.stato === 'RIFIUTATA').length,
          sospesa: det.filter((d) => d.stato === 'SOSPESA').length,
        });

        setUltimoAggiornamento(new Date());
        setErrore(null);
      })
      .catch((err) => setErrore(err.message ?? 'Errore caricamento metriche'))
      .finally(() => setCaricamento(false));
  };

  // Auto-refresh ogni 30 secondi
  useEffect(() => {
    caricaMetriche();

    // Conto alla rovescia visivo
    intervalloRef.current = setInterval(() => {
      setContatore((prev) => {
        if (prev <= 1) {
          caricaMetriche();
          return REFRESH_INTERVAL_MS / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalloRef.current) clearInterval(intervalloRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak.token]);

  const percHeap = metriche && metriche.heapTotale > 0
    ? Math.min(Math.round((metriche.heapUsato / metriche.heapTotale) * 100), 100)
    : 0;

  return (
    <Container className="py-4">
      {/* Header con contatore auto-refresh */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Metriche</h1>
        <div className="text-muted small">
          {caricamento && <Spinner small active label="Aggiornamento in corso..." className="me-2" />}
          🔄 Aggiornamento in {contatore}s — Ultimo: {ultimoAggiornamento.toLocaleTimeString('it-IT')}
        </div>
      </div>

      {errore && (
        <Alert color="warning" className="mb-3">
          {errore} — Le metriche JVM potrebbero non essere disponibili.
        </Alert>
      )}

      {/* Metriche JVM */}
      <h2 className="h5 mb-3">Metriche JVM Process Engine</h2>
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card>
            <CardBody>
              <CardTitle tag="h3" className="h6 text-muted mb-2">Heap Memory</CardTitle>
              <span className="d-block" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.heapUsato ?? '—'} MB
              </span>
              <small className="text-muted">/ {metriche?.heapTotale ?? '—'} MB totali</small>
              {metriche && metriche.heapTotale > 0 && (
                <Progress
                  value={percHeap}
                  color={percHeap > 80 ? 'danger' : 'success'}
                  className="mt-2"
                  aria-label={`Heap memory: ${percHeap}%`}
                />
              )}
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card>
            <CardBody>
              <CardTitle tag="h3" className="h6 text-muted mb-2">CPU Usage</CardTitle>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.cpuUsage ?? '—'}%
              </span>
              {metriche && (
                <Progress
                  value={metriche.cpuUsage}
                  color={metriche.cpuUsage > 80 ? 'danger' : 'primary'}
                  className="mt-2"
                  aria-label={`CPU: ${metriche.cpuUsage}%`}
                />
              )}
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card>
            <CardBody>
              <CardTitle tag="h3" className="h6 text-muted mb-2">Thread Attivi</CardTitle>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.threadAttivi ?? '—'}
              </span>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card>
            <CardBody>
              <CardTitle tag="h3" className="h6 text-muted mb-2">Uptime</CardTitle>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.uptime ?? '—'}h
              </span>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Distribuzione stati atti */}
      <h2 className="h5 mb-3">Distribuzione Stati Atti</h2>
      <Row className="mb-4">
        {[
          { etichetta: 'Pubblicati', valore: statistiche?.pubblicata, colore: '#3e8635' },
          { etichetta: 'In Lavorazione', valore: statistiche?.inLavorazione, colore: '#f0ab00' },
          { etichetta: 'Rifiutati', valore: statistiche?.rifiutata, colore: '#c9190b' },
          { etichetta: 'Sospesi', valore: statistiche?.sospesa, colore: '#6a6e73' },
        ].map(({ etichetta, valore, colore }) => (
          <Col key={etichetta} xs={6} lg={3} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h3" className="h6 text-muted mb-2">{etichetta}</CardTitle>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: colore }}>
                  {valore ?? 0}
                </span>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Embed Grafana */}
      <h2 className="h5 mb-3">Dashboard Grafana</h2>
      <Card>
        <CardBody className="p-0">
          <iframe
            src={GRAFANA_DASHBOARD_URL}
            title="Dashboard Grafana — Atti Amministrativi"
            style={{ width: '100%', height: '600px', border: 'none', borderRadius: '4px' }}
          />
        </CardBody>
      </Card>
    </Container>
  );
};

export default MetricheAdmin;
