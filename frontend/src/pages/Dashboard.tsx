import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
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

  useEffect(() => {
    // Recupera tutte le determinazioni dal backend
    axios
      .get('/determinazioni', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setDeterminazioni(res.data))
      .catch(console.error);
  }, [keycloak.token]);

  const totale = determinazioni.length;
  const inLavorazione = determinazioni.filter(
    (d) => d.stato === 'ISTRUTTORIA' || d.stato === 'VISTO_CONTABILE'
  ).length;
  const firmate = determinazioni.filter((d) => d.stato === 'FIRMATA').length;
  const pubblicate = determinazioni.filter((d) => d.stato === 'PUBBLICATA').length;

  return (
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Dashboard
      </Title>
      <Grid hasGutter>
        <GridItem span={3}>
          <Card>
            <CardTitle>Totale Determinazioni</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totale}</span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>In Lavorazione</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0ab00' }}>
                {inLavorazione}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Firmate</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06c' }}>
                {firmate}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Pubblicate</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3e8635' }}>
                {pubblicate}
              </span>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default Dashboard;
