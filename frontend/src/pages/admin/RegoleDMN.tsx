import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from 'design-react-kit';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

/** Struttura di una decision table DMN */
interface DecisionDMN {
  id: string;
  nome: string;
  versione: string;
  numeroRegole: number;
  ultimaModifica: string;
  descrizione?: string;
  inputs?: string[];
  outputs?: string[];
  regole?: Array<Record<string, string>>;
}

/** URL del KIE Sandbox per l'editor DMN */
const KIE_SANDBOX_URL = 'http://localhost:9090';

/**
 * Pagina di visualizzazione delle regole DMN attive nel motore Kogito.
 * Mostra la lista delle decision table con possibilità di visualizzare
 * i dettagli o aprire il DMN nel KIE Sandbox per la modifica.
 */
const RegoleDMN: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [decisioni, setDecisioni] = useState<DecisionDMN[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [decisioneSelezionata, setDecisioneSelezionata] = useState<DecisionDMN | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!keycloak.token) return;
    setCaricamento(true);
    axios
      .get('/decisions', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setDecisioni(res.data ?? []))
      .catch((err) => {
        // Dati di fallback per visualizzare la regola verifica-competenza.dmn
        setErrore(err.message ?? 'Errore caricamento');
        setDecisioni([
          {
            id: 'verifica-competenza',
            nome: 'verifica-competenza.dmn',
            versione: '1.0',
            numeroRegole: 3,
            ultimaModifica: new Date().toISOString(),
            descrizione: "Verifica la competenza del dirigente in base al livello e all'importo della determinazione",
            inputs: ['Livello Dirigente', 'Importo'],
            outputs: ['Competente', 'Motivazione'],
            regole: [
              { 'Livello Dirigente': 'D1', 'Importo': '<= 5000', 'Competente': 'true', 'Motivazione': 'D1 competente fino a €5.000' },
              { 'Livello Dirigente': 'D2', 'Importo': '<= 25000', 'Competente': 'true', 'Motivazione': 'D2 competente fino a €25.000' },
              { 'Livello Dirigente': 'D3', 'Importo': '<= 100000', 'Competente': 'true', 'Motivazione': 'D3 competente fino a €100.000' },
            ],
          },
        ]);
      })
      .finally(() => setCaricamento(false));
  }, [keycloak.token]);

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">Regole DMN</h1>

      {caricamento && (
        <div className="text-center py-4">
          <Spinner active label="Caricamento regole DMN..." />
        </div>
      )}

      {errore && (
        <Alert color="warning" className="mb-3">
          Impossibile caricare le regole dal motore: {errore}. Visualizzazione dati locali.
        </Alert>
      )}

      {!caricamento && (
        <>
          <Row>
            {decisioni.map((d) => (
              <Col key={d.id} xs={12} className="mb-3">
                <Card>
                  <CardBody>
                    <CardTitle tag="h2" className="h5">
                      📐 {d.nome}{' '}
                      <small className="text-muted">v{d.versione}</small>
                    </CardTitle>
                    {d.descrizione && (
                      <p className="text-muted mb-3">{d.descrizione}</p>
                    )}
                    <dl className="row mb-3">
                      <dt className="col-sm-3">Numero Regole:</dt>
                      <dd className="col-sm-9">{d.numeroRegole}</dd>
                      <dt className="col-sm-3">Ultima Modifica:</dt>
                      <dd className="col-sm-9">
                        {d.ultimaModifica
                          ? new Date(d.ultimaModifica).toLocaleDateString('it-IT')
                          : '-'}
                      </dd>
                      {d.inputs && (
                        <>
                          <dt className="col-sm-3">Input:</dt>
                          <dd className="col-sm-9">{d.inputs.join(', ')}</dd>
                        </>
                      )}
                      {d.outputs && (
                        <>
                          <dt className="col-sm-3">Output:</dt>
                          <dd className="col-sm-9">{d.outputs.join(', ')}</dd>
                        </>
                      )}
                    </dl>
                    <div className="d-flex gap-2">
                      <Button
                        color="secondary"
                        outline
                        onClick={() => { setDecisioneSelezionata(d); setIsModalOpen(true); }}
                      >
                        👁 Visualizza
                      </Button>
                      <a
                        href={KIE_SANDBOX_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary"
                      >
                        ✏ Apri in KIE Sandbox ↗
                      </a>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {decisioni.length === 0 && (
            <p className="text-muted">Nessuna regola DMN caricata nel motore.</p>
          )}
        </>
      )}

      {/* Modal visualizzazione dettaglio DMN */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        labelledBy="modal-dmn-title"
        size="lg"
      >
        <ModalHeader toggle={() => setIsModalOpen(false)} id="modal-dmn-title">
          DMN: {decisioneSelezionata?.nome}
        </ModalHeader>
        <ModalBody>
          {decisioneSelezionata && (
            <>
              {decisioneSelezionata.descrizione && (
                <p className="mb-3">{decisioneSelezionata.descrizione}</p>
              )}
              {decisioneSelezionata.regole && decisioneSelezionata.regole.length > 0 && (
                <Table responsive striped size="sm" aria-label="Regole DMN">
                  <thead>
                    <tr>
                      {Object.keys(decisioneSelezionata.regole[0]).map((col) => (
                        <th scope="col" key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {decisioneSelezionata.regole.map((regola, idx) => (
                      <tr key={idx}>
                        {Object.values(regola).map((val, colIdx) => (
                          <td key={colIdx}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setIsModalOpen(false)}>
            Chiudi
          </Button>
          <a
            href={KIE_SANDBOX_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-secondary"
          >
            Apri in KIE Sandbox ↗
          </a>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default RegoleDMN;
