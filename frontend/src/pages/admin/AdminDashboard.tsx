import React from 'react';
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
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useAdminStats } from '../../hooks/useAdmin';

/**
 * Dashboard amministrativa con statistiche globali sulle determinazioni.
 * Mostra contatori per stato, task in attesa, atti recenti e ultimi eventi di audit.
 */
const AdminDashboard: React.FC = () => {
  const { stats, caricamento, errore } = useAdminStats();

  if (caricamento) {
    return (
      <PageSection>
        <Spinner aria-label="Caricamento statistiche" size="xl" />
      </PageSection>
    );
  }

  if (errore) {
    return (
      <PageSection>
        <Alert variant="danger" title="Errore caricamento statistiche" isInline>
          {errore}
        </Alert>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1.5rem' }}>
        Console di Amministrazione
      </Title>

      {/* Statistiche istanze di processo */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        Istanze di Processo
      </Title>
      <Grid hasGutter style={{ marginBottom: '2rem' }}>
        <GridItem span={3}>
          <Card>
            <CardTitle>Totale Istanze</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats?.totaleIstanze ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Attive</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3e8635' }}>
                {stats?.istanzeAttive ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Completate</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06c' }}>
                {stats?.istanzeCompletate ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card>
            <CardTitle>Con Errore</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#c9190b' }}>
                {stats?.istanzeErrore ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Task in attesa per ruolo */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        Task in Attesa per Ruolo
      </Title>
      <Grid hasGutter style={{ marginBottom: '2rem' }}>
        <GridItem span={4}>
          <Card>
            <CardTitle>Istruttore</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0ab00' }}>
                {stats?.taskAttesaIstruttore ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>Ragioniere</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0ab00' }}>
                {stats?.taskAttesaRagioniere ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>Dirigente</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0ab00' }}>
                {stats?.taskAttesaDirigente ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Atti pubblicati per periodo */}
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        Atti Pubblicati
      </Title>
      <Grid hasGutter style={{ marginBottom: '2rem' }}>
        <GridItem span={4}>
          <Card>
            <CardTitle>Ultime 24h</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats?.attiUltime24h ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>Ultimi 7 giorni</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats?.attiUltimi7g ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>Ultimi 30 giorni</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats?.attiUltimi30g ?? 0}
              </span>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Tempo medio e ultimi eventi */}
      <Grid hasGutter>
        <GridItem span={4}>
          <Card>
            <CardTitle>Tempo Medio Completamento</CardTitle>
            <CardBody>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats?.tempoMedioCompletamento ?? 0}h
              </span>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={8}>
          <Card>
            <CardTitle>Ultimi 5 eventi di Audit</CardTitle>
            <CardBody>
              {stats?.ultimiEventiAudit?.length ? (
                <Table aria-label="Ultimi eventi audit" variant="compact">
                  <Thead>
                    <Tr>
                      <Th>Timestamp</Th>
                      <Th>Tipo Evento</Th>
                      <Th>Utente</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats.ultimiEventiAudit.map((e) => (
                      <Tr key={e.id}>
                        <Td>{e.timestamp ? new Date(e.timestamp).toLocaleString('it-IT') : '-'}</Td>
                        <Td>{e.tipoEvento}</Td>
                        <Td>{e.utente}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <span style={{ color: '#6a6e73' }}>Nessun evento di audit disponibile</span>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default AdminDashboard;
