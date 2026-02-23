import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Col, Container, Row, Spinner } from 'design-react-kit';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

/** Struttura dati di una determinazione */
interface Determinazione {
  id: number;
  numero: string;
  oggetto: string;
  importo: number;
  stato: string;
  dataCreazione: string;
}

/**
 * Dashboard principale con statistiche sulle determinazioni dirigenziali.
 * Mostra contatori per stato: totale, in lavorazione, firmate, pubblicate.
 */
const Dashboard: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [determinazioni, setDeterminazioni] = useState<Determinazione[]>([]);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    // Recupera tutte le determinazioni dal backend
    axios
      .get('/determinazioni', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setDeterminazioni(res.data))
      .catch(console.error)
      .finally(() => setCaricamento(false));
  }, [keycloak.token]);

  const totale = determinazioni.length;
  const inLavorazione = determinazioni.filter(
    (d) => d.stato === 'ISTRUTTORIA' || d.stato === 'VISTO_CONTABILE'
  ).length;
  const firmate = determinazioni.filter((d) => d.stato === 'FIRMATA').length;
  const pubblicate = determinazioni.filter((d) => d.stato === 'PUBBLICATA').length;

  if (caricamento) {
    return (
      <Container className="py-4 text-center">
        <Spinner active label="Caricamento dashboard..." />
      </Container>
    );
  }

  /** Dati delle card statistiche */
  const cards = [
    { titolo: 'Totale Determinazioni', valore: totale, colore: 'var(--colore-primario, #0066cc)' },
    { titolo: 'In Lavorazione', valore: inLavorazione, colore: '#f0ab00' },
    { titolo: 'Firmate', valore: firmate, colore: '#0066cc' },
    { titolo: 'Pubblicate', valore: pubblicate, colore: '#3e8635' },
  ];

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">Dashboard</h1>
      <Row>
        {cards.map(({ titolo, valore, colore }) => (
          <Col key={titolo} xs={12} sm={6} lg={3} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h2" className="h6 text-muted mb-2">
                  {titolo}
                </CardTitle>
                <span
                  className="d-block"
                  style={{ fontSize: '2rem', fontWeight: 'bold', color: colore }}
                  aria-label={`${titolo}: ${valore}`}
                >
                  {valore}
                </span>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
