import React, { useState } from 'react';
import {
  Alert,
  Button,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  PageSection,
  Spinner,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { useProcessInstances, ProcessFilter, ProcessInstance } from '../../hooks/useAdmin';

/** Stati possibili di una determinazione per il filtro */
const STATI_FILTRO = ['TUTTI', 'BOZZA', 'ISTRUTTORIA', 'VISTO_CONTABILE', 'FIRMATA', 'PUBBLICATA', 'RIFIUTATA', 'SOSPESA', 'TERMINATA'];

/** Restituisce il colore del badge in base allo stato */
const coloreStato = (stato: string): string => {
  switch (stato) {
    case 'PUBBLICATA':
    case 'FIRMATA':
      return '#3e8635';
    case 'ISTRUTTORIA':
    case 'VISTO_CONTABILE':
    case 'BOZZA':
      return '#f0ab00';
    case 'RIFIUTATA':
    case 'TERMINATA':
      return '#c9190b';
    case 'SOSPESA':
      return '#6a6e73';
    default:
      return '#6a6e73';
  }
};

/**
 * Pagina di gestione delle istanze di processo.
 * Mostra la lista delle determinazioni con filtri, azioni (sospendi, termina, riattiva)
 * e un modal per il dettaglio completo dell'istanza.
 */
const ProcessiAdmin: React.FC = () => {
  const { keycloak } = useKeycloak();

  // Stato filtri
  const [filtroStato, setFiltroStato] = useState('TUTTI');
  const [filtroUtente, setFiltroUtente] = useState('');
  const [filtroDa, setFiltroDa] = useState('');
  const [filtroA, setFiltroA] = useState('');

  // Filtri applicati (usati per il fetch)
  const [filtriApplicati, setFiltriApplicati] = useState<ProcessFilter>({});

  const { istanze, caricamento, errore } = useProcessInstances(filtriApplicati);

  // Stato modal
  const [istanzaSelezionata, setIstanzaSelezionata] = useState<ProcessInstance | null>(null);
  const [isDettaglioOpen, setIsDettaglioOpen] = useState(false);
  const [isConfermaTerminaOpen, setIsConfermaTerminaOpen] = useState(false);
  const [istanzaDaTerminare, setIstanzaDaTerminare] = useState<ProcessInstance | null>(null);

  // Stato operazioni
  const [operazioneInCorso, setOperazioneInCorso] = useState(false);
  const [messaggioOperazione, setMessaggioOperazione] = useState<{ tipo: 'success' | 'danger'; testo: string } | null>(null);

  /** Applica i filtri correnti */
  const applicaFiltri = () => {
    setFiltriApplicati({
      stato: filtroStato,
      utente: filtroUtente || undefined,
      dataDa: filtroDa || undefined,
      dataA: filtroA || undefined,
    });
  };

  /** Reimposta tutti i filtri */
  const reimpostaFiltri = () => {
    setFiltroStato('TUTTI');
    setFiltroUtente('');
    setFiltroDa('');
    setFiltroA('');
    setFiltriApplicati({});
  };

  /** Aggiorna lo stato di una determinazione */
  const aggiornaStato = (istanza: ProcessInstance, nuovoStato: string) => {
    setOperazioneInCorso(true);
    axios
      .put(
        `/determinazioni/${istanza.id}/stato`,
        { stato: nuovoStato },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => {
        setMessaggioOperazione({ tipo: 'success', testo: `Stato aggiornato a ${nuovoStato}` });
        // Aggiorna la lista riapplicando i filtri
        setFiltriApplicati({ ...filtriApplicati });
      })
      .catch((err) => {
        setMessaggioOperazione({ tipo: 'danger', testo: err.message ?? 'Errore aggiornamento stato' });
      })
      .finally(() => setOperazioneInCorso(false));
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Gestione Istanze di Processo
      </Title>

      {/* Messaggio operazione */}
      {messaggioOperazione && (
        <Alert
          variant={messaggioOperazione.tipo}
          title={messaggioOperazione.testo}
          isInline
          actionClose={<Button variant="plain" onClick={() => setMessaggioOperazione(null)}>×</Button>}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {/* Toolbar filtri */}
      <Toolbar style={{ marginBottom: '1rem' }}>
        <ToolbarContent>
          <ToolbarItem>
            <FormSelect
              value={filtroStato}
              onChange={(_e, v) => setFiltroStato(v)}
              aria-label="Filtra per stato"
            >
              {STATI_FILTRO.map((s) => (
                <FormSelectOption key={s} value={s} label={s} />
              ))}
            </FormSelect>
          </ToolbarItem>
          <ToolbarItem>
            <TextInput
              placeholder="Filtra per utente"
              value={filtroUtente}
              onChange={(_e, v) => setFiltroUtente(v)}
              aria-label="Filtra per utente"
            />
          </ToolbarItem>
          <ToolbarItem>
            <FormGroup label="Da" fieldId="filtroDa">
              <TextInput
                id="filtroDa"
                type="date"
                value={filtroDa}
                onChange={(_e, v) => setFiltroDa(v)}
                aria-label="Data da"
              />
            </FormGroup>
          </ToolbarItem>
          <ToolbarItem>
            <FormGroup label="A" fieldId="filtroA">
              <TextInput
                id="filtroA"
                type="date"
                value={filtroA}
                onChange={(_e, v) => setFiltroA(v)}
                aria-label="Data a"
              />
            </FormGroup>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary" onClick={applicaFiltri}>Applica</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="link" onClick={reimpostaFiltri}>Reimposta</Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {/* Stato caricamento o errore */}
      {caricamento && <Spinner aria-label="Caricamento istanze" size="xl" />}
      {errore && (
        <Alert variant="danger" title="Errore caricamento istanze" isInline>
          {errore}
        </Alert>
      )}

      {/* Tabella istanze */}
      {!caricamento && !errore && (
        <Table aria-label="Istanze di processo">
          <Thead>
            <Tr>
              <Th>ID Istanza</Th>
              <Th>Oggetto</Th>
              <Th>Stato</Th>
              <Th>Avviato da</Th>
              <Th>Data Avvio</Th>
              <Th>Importo (€)</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {istanze.length === 0 ? (
              <Tr>
                <Td colSpan={7}>Nessuna istanza trovata</Td>
              </Tr>
            ) : (
              istanze.map((ist) => (
                <Tr key={ist.id}>
                  <Td>{ist.id}</Td>
                  <Td>{ist.oggetto}</Td>
                  <Td>
                    <span
                      style={{
                        backgroundColor: coloreStato(ist.stato),
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {ist.stato}
                    </span>
                  </Td>
                  <Td>{ist.dirigente}</Td>
                  <Td>{ist.dataCreazione ? new Date(ist.dataCreazione).toLocaleDateString('it-IT') : '-'}</Td>
                  <Td>{ist.importo?.toLocaleString('it-IT')}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setIstanzaSelezionata(ist); setIsDettaglioOpen(true); }}
                      >
                        Dettaglio
                      </Button>
                      {(ist.stato === 'ISTRUTTORIA' || ist.stato === 'VISTO_CONTABILE' || ist.stato === 'BOZZA') && (
                        <Button
                          variant="warning"
                          size="sm"
                          isDisabled={operazioneInCorso}
                          onClick={() => aggiornaStato(ist, 'SOSPESA')}
                        >
                          Sospendi
                        </Button>
                      )}
                      {ist.stato !== 'TERMINATA' && ist.stato !== 'PUBBLICATA' && (
                        <Button
                          variant="danger"
                          size="sm"
                          isDisabled={operazioneInCorso}
                          onClick={() => { setIstanzaDaTerminare(ist); setIsConfermaTerminaOpen(true); }}
                        >
                          Termina
                        </Button>
                      )}
                      {ist.stato === 'SOSPESA' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isDisabled={operazioneInCorso}
                          onClick={() => aggiornaStato(ist, 'ISTRUTTORIA')}
                        >
                          Riattiva
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}

      {/* Modal dettaglio istanza */}
      <Modal
        variant={ModalVariant.large}
        title={`Dettaglio Istanza #${istanzaSelezionata?.id}`}
        isOpen={isDettaglioOpen}
        onClose={() => setIsDettaglioOpen(false)}
        actions={[
          <Button key="chiudi" variant="primary" onClick={() => setIsDettaglioOpen(false)}>
            Chiudi
          </Button>,
        ]}
      >
        {istanzaSelezionata && (
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem 1rem' }}>
            <dt><strong>ID:</strong></dt><dd>{istanzaSelezionata.id}</dd>
            <dt><strong>Numero:</strong></dt><dd>{istanzaSelezionata.numero}</dd>
            <dt><strong>Oggetto:</strong></dt><dd>{istanzaSelezionata.oggetto}</dd>
            <dt><strong>Stato:</strong></dt>
            <dd>
              <span style={{ backgroundColor: coloreStato(istanzaSelezionata.stato), color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                {istanzaSelezionata.stato}
              </span>
            </dd>
            <dt><strong>Dirigente:</strong></dt><dd>{istanzaSelezionata.dirigente}</dd>
            <dt><strong>Importo:</strong></dt><dd>€ {istanzaSelezionata.importo?.toLocaleString('it-IT')}</dd>
            <dt><strong>Data Creazione:</strong></dt>
            <dd>{istanzaSelezionata.dataCreazione ? new Date(istanzaSelezionata.dataCreazione).toLocaleString('it-IT') : '-'}</dd>
            <dt><strong>ID Processo Kogito:</strong></dt><dd>{istanzaSelezionata.processInstanceId ?? '-'}</dd>
          </dl>
        )}
      </Modal>

      {/* Dialog conferma terminazione */}
      <Modal
        variant={ModalVariant.small}
        title="Conferma Terminazione"
        isOpen={isConfermaTerminaOpen}
        onClose={() => setIsConfermaTerminaOpen(false)}
        actions={[
          <Button
            key="termina"
            variant="danger"
            isDisabled={operazioneInCorso}
            onClick={() => {
              if (istanzaDaTerminare) {
                aggiornaStato(istanzaDaTerminare, 'TERMINATA');
                setIsConfermaTerminaOpen(false);
              }
            }}
          >
            Sì, Termina
          </Button>,
          <Button key="annulla" variant="link" onClick={() => setIsConfermaTerminaOpen(false)}>
            Annulla
          </Button>,
        ]}
      >
        <p>
          Sei sicuro di voler terminare l'istanza <strong>#{istanzaDaTerminare?.id}</strong> —{' '}
          <em>{istanzaDaTerminare?.oggetto}</em>?
        </p>
        <p>L'operazione non è reversibile.</p>
      </Modal>
    </PageSection>
  );
};

export default ProcessiAdmin;
