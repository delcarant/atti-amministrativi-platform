import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Container,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from 'design-react-kit';
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
      return 'success';
    case 'ISTRUTTORIA':
    case 'VISTO_CONTABILE':
    case 'BOZZA':
      return 'warning';
    case 'RIFIUTATA':
    case 'TERMINATA':
      return 'danger';
    case 'SOSPESA':
      return 'secondary';
    default:
      return 'secondary';
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
        setFiltriApplicati({ ...filtriApplicati });
      })
      .catch((err) => {
        setMessaggioOperazione({ tipo: 'danger', testo: err.message ?? 'Errore aggiornamento stato' });
      })
      .finally(() => setOperazioneInCorso(false));
  };

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">Gestione Istanze di Processo</h1>

      {/* Messaggio operazione */}
      {messaggioOperazione && (
        <Alert color={messaggioOperazione.tipo} className="mb-3" isOpen toggle={() => setMessaggioOperazione(null)}>
          {messaggioOperazione.testo}
        </Alert>
      )}

      {/* Barra filtri */}
      <div className="d-flex gap-2 align-items-end mb-3 flex-wrap">
        <div>
          <Label for="filtroStatoP">Stato</Label>
          <Input
            id="filtroStatoP"
            type="select"
            value={filtroStato}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroStato(e.target.value)}
            aria-label="Filtra per stato"
            noWrapper
          >
            {STATI_FILTRO.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Input>
        </div>
        <FormGroup>
          <Input
            id="filtroUtenteP"
            label="Utente"
            placeholder="Filtra per utente"
            value={filtroUtente}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroUtente(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Input
            id="filtroDaP"
            type="date"
            label="Da"
            value={filtroDa}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroDa(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Input
            id="filtroAP"
            type="date"
            label="A"
            value={filtroA}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroA(e.target.value)}
          />
        </FormGroup>
        <div className="d-flex gap-2">
          <Button color="primary" onClick={applicaFiltri}>Applica</Button>
          <Button color="secondary" outline onClick={reimpostaFiltri}>Reimposta</Button>
        </div>
      </div>

      {caricamento && (
        <div className="text-center py-4">
          <Spinner active label="Caricamento istanze..." />
        </div>
      )}

      {errore && (
        <Alert color="danger">{errore}</Alert>
      )}

      {/* Tabella istanze */}
      {!caricamento && !errore && (
        <Table responsive hover striped aria-label="Istanze di processo">
          <thead>
            <tr>
              <th scope="col">ID Istanza</th>
              <th scope="col">Oggetto</th>
              <th scope="col">Stato</th>
              <th scope="col">Dirigente</th>
              <th scope="col">Importo (€)</th>
              <th scope="col">Data</th>
              <th scope="col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {istanze.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">Nessuna istanza trovata</td>
              </tr>
            ) : (
              istanze.map((ist) => (
                <tr key={ist.id}>
                  <td>{ist.processInstanceId ?? ist.id}</td>
                  <td>{ist.oggetto}</td>
                  <td>
                    <Badge color={coloreStato(ist.stato)} pill>
                      {ist.stato}
                    </Badge>
                  </td>
                  <td>{ist.dirigente}</td>
                  <td>{ist.importo?.toLocaleString('it-IT')}</td>
                  <td>
                    {ist.dataCreazione
                      ? new Date(ist.dataCreazione).toLocaleDateString('it-IT')
                      : '-'}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <Button
                        color="secondary"
                        size="sm"
                        outline
                        onClick={() => {
                          setIstanzaSelezionata(ist);
                          setIsDettaglioOpen(true);
                        }}
                      >
                        Dettaglio
                      </Button>
                      {ist.stato !== 'SOSPESA' && ist.stato !== 'TERMINATA' && (
                        <Button
                          color="warning"
                          size="sm"
                          disabled={operazioneInCorso}
                          onClick={() => aggiornaStato(ist, 'SOSPESA')}
                        >
                          Sospendi
                        </Button>
                      )}
                      {ist.stato === 'SOSPESA' && (
                        <Button
                          color="success"
                          size="sm"
                          disabled={operazioneInCorso}
                          onClick={() => aggiornaStato(ist, 'ISTRUTTORIA')}
                        >
                          Riattiva
                        </Button>
                      )}
                      {ist.stato !== 'TERMINATA' && ist.stato !== 'PUBBLICATA' && (
                        <Button
                          color="danger"
                          size="sm"
                          disabled={operazioneInCorso}
                          onClick={() => {
                            setIstanzaDaTerminare(ist);
                            setIsConfermaTerminaOpen(true);
                          }}
                        >
                          Termina
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal dettaglio istanza */}
      <Modal
        isOpen={isDettaglioOpen}
        toggle={() => setIsDettaglioOpen(false)}
        labelledBy="modal-dettaglio-title"
        size="lg"
      >
        <ModalHeader toggle={() => setIsDettaglioOpen(false)} id="modal-dettaglio-title">
          Dettaglio Istanza: {istanzaSelezionata?.processInstanceId ?? istanzaSelezionata?.id}
        </ModalHeader>
        <ModalBody>
          {istanzaSelezionata && (
            <dl className="row">
              <dt className="col-sm-4">Numero:</dt>
              <dd className="col-sm-8">{istanzaSelezionata.numero}</dd>
              <dt className="col-sm-4">Oggetto:</dt>
              <dd className="col-sm-8">{istanzaSelezionata.oggetto}</dd>
              <dt className="col-sm-4">Stato:</dt>
              <dd className="col-sm-8">
                <Badge color={coloreStato(istanzaSelezionata.stato)} pill>
                  {istanzaSelezionata.stato}
                </Badge>
              </dd>
              <dt className="col-sm-4">Dirigente:</dt>
              <dd className="col-sm-8">{istanzaSelezionata.dirigente}</dd>
              <dt className="col-sm-4">Importo:</dt>
              <dd className="col-sm-8">€ {istanzaSelezionata.importo?.toLocaleString('it-IT')}</dd>
              <dt className="col-sm-4">Data Creazione:</dt>
              <dd className="col-sm-8">
                {istanzaSelezionata.dataCreazione
                  ? new Date(istanzaSelezionata.dataCreazione).toLocaleString('it-IT')
                  : '-'}
              </dd>
            </dl>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setIsDettaglioOpen(false)}>Chiudi</Button>
        </ModalFooter>
      </Modal>

      {/* Modal conferma terminazione */}
      <Modal
        isOpen={isConfermaTerminaOpen}
        toggle={() => setIsConfermaTerminaOpen(false)}
        labelledBy="modal-termina-title"
        size="sm"
      >
        <ModalHeader toggle={() => setIsConfermaTerminaOpen(false)} id="modal-termina-title">
          Conferma Terminazione
        </ModalHeader>
        <ModalBody>
          <p>
            Sei sicuro di voler terminare il processo{' '}
            <strong>{istanzaDaTerminare?.processInstanceId ?? istanzaDaTerminare?.id}</strong>?
          </p>
          <p className="text-danger">Questa operazione non può essere annullata.</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            disabled={operazioneInCorso}
            onClick={() => {
              if (istanzaDaTerminare) {
                aggiornaStato(istanzaDaTerminare, 'TERMINATA');
              }
              setIsConfermaTerminaOpen(false);
            }}
          >
            Conferma Terminazione
          </Button>
          <Button color="secondary" outline onClick={() => setIsConfermaTerminaOpen(false)}>
            Annulla
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default ProcessiAdmin;
