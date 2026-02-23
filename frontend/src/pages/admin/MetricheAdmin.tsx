import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

/** URL del dashboard Grafana preconfigurato */
const GRAFANA_DASHBOARD_URL = 'http://localhost:3001/d/atti-dashboard';

/** Struttura metriche JVM */
interface MetricheJVM {
  heapUsato: number;
  heapTotale: number;
  cpuUsage: number;
  threadAttivi: number;
  uptime: number;
}

/** Struttura metriche statistiche atti */
interface StatisticheAtti {
  pubblicata: number;
  inLavorazione: number;
  rifiutata: number;
  sospesa: number;
}

/** Intervallo auto-refresh in millisecondi (30 secondi) */
const REFRESH_INTERVAL_MS = 30000;

/**
 * Dashboard metriche avanzate.
 * Incorpora un iframe Grafana e mostra metriche native PatternFly
 * con auto-refresh ogni 30 secondi.
 */
const MetricheAdmin: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [metriche, setMetriche] = useState<MetricheJVM | null>(null);
  const [statistiche, setStatistiche] = useState<StatisticheAtti | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState<Date>(new Date());
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
  }, [keycloak.token]);

  return (
    <PageSection>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Title headingLevel="h1" size="xl">
          Metriche
        </Title>
        <div style={{ color: '#6a6e73', fontSize: '0.875rem' }}>
          {caricamento && <Spinner size="md" aria-label="Aggiornamento in corso" style={{ marginRight: '0.5rem' }} />}
          🔄 Aggiornamento automatico in {contatore}s — Ultimo: {ultimoAggiornamento.toLocaleTimeString('it-IT')}
        </div>
      </div>

      {errore && (
        <Alert variant="warning" title="Avviso metriche" isInline style={{ marginBottom: '1rem' }}>
          {errore} — Le metriche JVM potrebbero non essere disponibili.
        </Alert>
      )}

      {/* Metriche JVM */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        Metriche JVM Process Engine
      </Title>
      <Grid hasGutter style={{ marginBottom: '2rem' }}>
        <GridItem span={3}>
          <Card>
            <CardTitle>Heap Memory</CardTitle>
            <CardBody>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.heapUsato ?? '—'} MB
              </span>
              <br />
              <span style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                / {metriche?.heapTotale ?? '—'} MB totali
              </span>
              {metriche && metriche.heapTotale > 0 && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    height: '8px',
                    backgroundColor: '#d2d2d2',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min((metriche.heapUsato / metriche.heapTotale) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor: metriche.heapUsato / metriche.heapTotale > 0.8 ? '#c9190b' : '#3e8635',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>CPU Usage</CardTitle>
            <CardBody>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.cpuUsage ?? '—'}%
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Thread Attivi</CardTitle>
            <CardBody>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.threadAttivi ?? '—'}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Uptime</CardTitle>
            <CardBody>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {metriche?.uptime ?? '—'}h
              </span>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Distribuzione stati atti */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        Distribuzione Stati Atti
      </Title>
      <Grid hasGutter style={{ marginBottom: '2rem' }}>
        {[
          { etichetta: 'Pubblicati', valore: statistiche?.pubblicata, colore: '#3e8635' },
          { etichetta: 'In Lavorazione', valore: statistiche?.inLavorazione, colore: '#f0ab00' },
          { etichetta: 'Rifiutati', valore: statistiche?.rifiutata, colore: '#c9190b' },
          { etichetta: 'Sospesi', valore: statistiche?.sospesa, colore: '#6a6e73' },
        ].map(({ etichetta, valore, colore }) => (
          <GridItem span={3} key={etichetta}>
            <Card>
              <CardTitle>{etichetta}</CardTitle>
              <CardBody>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: colore }}>
                  {valore ?? 0}
                </span>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* Embed Grafana */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        Dashboard Grafana
      </Title>
      <Card>
        <CardBody style={{ padding: 0 }}>
          <iframe
            src={GRAFANA_DASHBOARD_URL}
            title="Dashboard Grafana — Atti Amministrativi"
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              borderRadius: '4px',
            }}
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export default MetricheAdmin;
