import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Modal,
  ModalVariant,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
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
      .catch(() => {
        // Dati di fallback per visualizzare la regola verifica-competenza.dmn
        setDecisioni([
          {
            id: 'verifica-competenza',
            nome: 'verifica-competenza.dmn',
            versione: '1.0',
            numeroRegole: 3,
            ultimaModifica: new Date().toISOString(),
            descrizione: 'Verifica la competenza del dirigente in base al livello e all\'importo della determinazione',
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
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Regole DMN
      </Title>

      {caricamento && <Spinner aria-label="Caricamento regole DMN" size="xl" />}
      {errore && (
        <Alert variant="warning" title="Utilizzo dati di fallback" isInline style={{ marginBottom: '1rem' }}>
          Impossibile caricare le regole dal motore: {errore}. Visualizzazione dati locali.
        </Alert>
      )}

      {!caricamento && (
        <>
          <Grid hasGutter>
            {decisioni.map((d) => (
              <GridItem key={d.id} span={12}>
                <Card>
                  <CardTitle>
                    📐 {d.nome}{' '}
                    <span style={{ fontSize: '0.8rem', color: '#6a6e73', marginLeft: '8px' }}>
                      v{d.versione}
                    </span>
                  </CardTitle>
                  <CardBody>
                    {d.descrizione && <p style={{ marginBottom: '0.5rem', color: '#6a6e73' }}>{d.descrizione}</p>}
                    <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.25rem 1rem', marginBottom: '1rem' }}>
                      <dt><strong>Numero Regole:</strong></dt><dd>{d.numeroRegole}</dd>
                      <dt><strong>Ultima Modifica:</strong></dt>
                      <dd>{d.ultimaModifica ? new Date(d.ultimaModifica).toLocaleDateString('it-IT') : '-'}</dd>
                      {d.inputs && <><dt><strong>Input:</strong></dt><dd>{d.inputs.join(', ')}</dd></>}
                      {d.outputs && <><dt><strong>Output:</strong></dt><dd>{d.outputs.join(', ')}</dd></>}
                    </dl>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Button
                        variant="secondary"
                        onClick={() => { setDecisioneSelezionata(d); setIsModalOpen(true); }}
                      >
                        👁️ Visualizza
                      </Button>
                      <Button
                        variant="link"
                        component="a"
                        href={KIE_SANDBOX_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ✏️ Apri in KIE Sandbox ↗
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>

          {decisioni.length === 0 && (
            <p style={{ color: '#6a6e73' }}>Nessuna regola DMN caricata nel motore.</p>
          )}
        </>
      )}

      {/* Modal visualizzazione dettaglio DMN */}
      <Modal
        variant={ModalVariant.large}
        title={`DMN: ${decisioneSelezionata?.nome}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={[
          <Button key="chiudi" variant="primary" onClick={() => setIsModalOpen(false)}>
            Chiudi
          </Button>,
          <Button
            key="apri"
            variant="link"
            component="a"
            href={KIE_SANDBOX_URL}
            target="_blank"
            rel="noreferrer"
          >
            Apri in KIE Sandbox ↗
          </Button>,
        ]}
      >
        {decisioneSelezionata && (
          <>
            <p style={{ marginBottom: '1rem' }}>{decisioneSelezionata.descrizione}</p>
            {decisioneSelezionata.regole && decisioneSelezionata.regole.length > 0 && (
              <Table aria-label="Regole DMN" variant="compact">
                <Thead>
                  <Tr>
                    {Object.keys(decisioneSelezionata.regole[0]).map((col) => (
                      <Th key={col}>{col}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {decisioneSelezionata.regole.map((regola, idx) => (
                    <Tr key={idx}>
                      {Object.values(regola).map((val, colIdx) => (
                        <Td key={colIdx}>{val}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </>
        )}
      </Modal>
    </PageSection>
  );
};

export default RegoleDMN;
