import React from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Row,
  Spinner,
  Table,
} from 'design-react-kit';
import { useAdminStats } from '../../hooks/useAdmin';

/**
 * Dashboard amministrativa con statistiche globali sulle determinazioni.
 * Mostra contatori per stato, task in attesa, atti recenti e ultimi eventi di audit.
 */
const AdminDashboard: React.FC = () => {
  const { stats, caricamento, errore } = useAdminStats();

  if (caricamento) {
    return (
      <Container className="py-4 text-center">
        <Spinner active label="Caricamento statistiche..." />
      </Container>
    );
  }

  if (errore) {
    return (
      <Container className="py-4">
        <Alert color="danger">{errore}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">Console di Amministrazione</h1>

      {/* Statistiche istanze di processo */}
      <h2 className="h5 mb-3">Istanze di Processo</h2>
      <Row className="mb-4">
        {[
          { titolo: 'Totale Istanze', valore: stats?.totaleIstanze ?? 0, colore: 'var(--colore-primario, #0066cc)' },
          { titolo: 'Attive', valore: stats?.istanzeAttive ?? 0, colore: '#3e8635' },
          { titolo: 'Completate', valore: stats?.istanzeCompletate ?? 0, colore: '#0066cc' },
          { titolo: 'Con Errore', valore: stats?.istanzeErrore ?? 0, colore: '#c9190b' },
        ].map(({ titolo, valore, colore }) => (
          <Col key={titolo} xs={6} lg={3} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h3" className="h6 text-muted mb-2">{titolo}</CardTitle>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: colore }}>{valore}</span>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Task in attesa per ruolo */}
      <h2 className="h5 mb-3">Task in Attesa per Ruolo</h2>
      <Row className="mb-4">
        {[
          { titolo: 'Istruttore', valore: stats?.taskAttesaIstruttore ?? 0 },
          { titolo: 'Ragioniere', valore: stats?.taskAttesaRagioniere ?? 0 },
          { titolo: 'Dirigente', valore: stats?.taskAttesaDirigente ?? 0 },
        ].map(({ titolo, valore }) => (
          <Col key={titolo} xs={12} md={4} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h3" className="h6 text-muted mb-2">{titolo}</CardTitle>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0ab00' }}>{valore}</span>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Atti pubblicati per periodo */}
      <h2 className="h5 mb-3">Atti Pubblicati</h2>
      <Row className="mb-4">
        {[
          { titolo: 'Ultime 24h', valore: stats?.attiUltime24h ?? 0 },
          { titolo: 'Ultimi 7 giorni', valore: stats?.attiUltimi7g ?? 0 },
          { titolo: 'Ultimi 30 giorni', valore: stats?.attiUltimi30g ?? 0 },
        ].map(({ titolo, valore }) => (
          <Col key={titolo} xs={12} md={4} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h3" className="h6 text-muted mb-2">{titolo}</CardTitle>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{valore}</span>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tempo medio e ultimi eventi */}
      <Row>
        <Col xs={12} md={4} className="mb-3">
          <Card>
            <CardBody>
              <CardTitle tag="h3" className="h6 text-muted mb-2">Tempo Medio Completamento</CardTitle>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats?.tempoMedioCompletamento ?? 0}h
              </span>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} md={8} className="mb-3">
          <Card>
            <CardBody>
              <CardTitle tag="h3" className="h6 text-muted mb-2">Ultimi 5 eventi di Audit</CardTitle>
              {stats?.ultimiEventiAudit?.length ? (
                <Table responsive size="sm" aria-label="Ultimi eventi audit">
                  <thead>
                    <tr>
                      <th scope="col">Timestamp</th>
                      <th scope="col">Tipo Evento</th>
                      <th scope="col">Utente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ultimiEventiAudit.map((e) => (
                      <tr key={e.id}>
                        <td>{e.timestamp ? new Date(e.timestamp).toLocaleString('it-IT') : '-'}</td>
                        <td>{e.tipoEvento}</td>
                        <td>{e.utente}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <span className="text-muted">Nessun evento di audit disponibile</span>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
