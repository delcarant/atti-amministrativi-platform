import React, { useEffect, useState } from 'react';
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

/** Struttura dati di un utente */
interface Utente {
  id: string;
  username: string;
  nome: string;
  cognome: string;
  email: string;
  ruoli: string[];
  abilitato: boolean;
  ultimoAccesso?: string;
}

/** Ruoli disponibili nell'applicazione */
const RUOLI_DISPONIBILI = ['istruttore', 'ragioniere', 'dirigente', 'admin'];

/** Filtri per utenti */
const STATI_UTENTE = ['TUTTI', 'ATTIVO', 'DISABILITATO'];

/**
 * Pagina di gestione utenti integrata con Keycloak tramite le API del process-engine.
 * Permette visualizzazione, modifica ruoli, disabilitazione e reset password.
 */
const UtentiAdmin: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  // Filtri
  const [filtroRuolo, setFiltroRuolo] = useState('TUTTI');
  const [filtroStato, setFiltroStato] = useState('TUTTI');

  // Modal
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [isDettaglioOpen, setIsDettaglioOpen] = useState(false);
  const [isModificaRuoliOpen, setIsModificaRuoliOpen] = useState(false);
  const [isNuovoUtenteOpen, setIsNuovoUtenteOpen] = useState(false);
  const [ruoliSelezionati, setRuoliSelezionati] = useState<string[]>([]);

  // Form nuovo utente
  const [nuovoUtente, setNuovoUtente] = useState({
    username: '', nome: '', cognome: '', email: '', ruolo: 'istruttore',
  });

  // Messaggi operazione
  const [messaggioOperazione, setMessaggioOperazione] = useState<{ tipo: string; testo: string } | null>(null);
  const [operazioneInCorso, setOperazioneInCorso] = useState(false);

  /** Carica la lista utenti dal backend */
  const caricaUtenti = () => {
    setCaricamento(true);
    axios
      .get('/admin/utenti', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setUtenti(res.data ?? []))
      .catch((err) => setErrore(err.message ?? 'Errore caricamento utenti'))
      .finally(() => setCaricamento(false));
  };

  useEffect(() => {
    if (keycloak.token) caricaUtenti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak.token]);

  /** Filtra gli utenti per ruolo e stato */
  const utentiFiltrati = utenti.filter((u) => {
    const passaRuolo = filtroRuolo === 'TUTTI' || u.ruoli?.includes(filtroRuolo);
    const passaStato =
      filtroStato === 'TUTTI' ||
      (filtroStato === 'ATTIVO' && u.abilitato) ||
      (filtroStato === 'DISABILITATO' && !u.abilitato);
    return passaRuolo && passaStato;
  });

  /** Attiva/disattiva un utente */
  const toggleAbilitazione = (utente: Utente) => {
    setOperazioneInCorso(true);
    axios
      .put(
        `/admin/utenti/${utente.id}`,
        { abilitato: !utente.abilitato },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => {
        setMessaggioOperazione({
          tipo: 'success',
          testo: `Utente ${utente.username} ${utente.abilitato ? 'disabilitato' : 'abilitato'}`,
        });
        caricaUtenti();
      })
      .catch((err) => setMessaggioOperazione({ tipo: 'danger', testo: err.message ?? 'Errore' }))
      .finally(() => setOperazioneInCorso(false));
  };

  /** Invia email di reset password */
  const resetPassword = (utente: Utente) => {
    setOperazioneInCorso(true);
    axios
      .post(
        `/admin/utenti/${utente.id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => setMessaggioOperazione({ tipo: 'success', testo: `Email di reset inviata a ${utente.email}` }))
      .catch((err) => setMessaggioOperazione({ tipo: 'danger', testo: err.message ?? 'Errore reset password' }))
      .finally(() => setOperazioneInCorso(false));
  };

  /** Salva i ruoli modificati per un utente */
  const salvaRuoli = () => {
    if (!utenteSelezionato) return;
    setOperazioneInCorso(true);
    axios
      .put(
        `/admin/utenti/${utenteSelezionato.id}/ruoli`,
        { ruoli: ruoliSelezionati },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => {
        setMessaggioOperazione({ tipo: 'success', testo: 'Ruoli aggiornati' });
        setIsModificaRuoliOpen(false);
        caricaUtenti();
      })
      .catch((err) => setMessaggioOperazione({ tipo: 'danger', testo: err.message ?? 'Errore aggiornamento ruoli' }))
      .finally(() => setOperazioneInCorso(false));
  };

  /** Crea un nuovo utente */
  const creaNuovoUtente = () => {
    setOperazioneInCorso(true);
    axios
      .post(
        '/admin/utenti',
        { ...nuovoUtente, ruoli: [nuovoUtente.ruolo] },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => {
        setMessaggioOperazione({ tipo: 'success', testo: `Utente ${nuovoUtente.username} creato` });
        setIsNuovoUtenteOpen(false);
        setNuovoUtente({ username: '', nome: '', cognome: '', email: '', ruolo: 'istruttore' });
        caricaUtenti();
      })
      .catch((err) => setMessaggioOperazione({ tipo: 'danger', testo: err.message ?? 'Errore creazione utente' }))
      .finally(() => setOperazioneInCorso(false));
  };

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">Gestione Utenti</h1>

      {/* Messaggio operazione */}
      {messaggioOperazione && (
        <Alert color={messaggioOperazione.tipo} className="mb-3" isOpen toggle={() => setMessaggioOperazione(null)}>
          {messaggioOperazione.testo}
        </Alert>
      )}

      {/* Barra filtri */}
      <div className="d-flex gap-2 align-items-end mb-3 flex-wrap">
        <div>
          <Label for="filtroRuolo">Ruolo</Label>
          <Input
            id="filtroRuolo"
            type="select"
            value={filtroRuolo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroRuolo(e.target.value)}
            aria-label="Filtra per ruolo"
            noWrapper
          >
            <option value="TUTTI">TUTTI</option>
            {RUOLI_DISPONIBILI.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Input>
        </div>
        <div>
          <Label for="filtroStatoU">Stato</Label>
          <Input
            id="filtroStatoU"
            type="select"
            value={filtroStato}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroStato(e.target.value)}
            aria-label="Filtra per stato"
            noWrapper
          >
            {STATI_UTENTE.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Input>
        </div>
        <Button color="primary" onClick={() => setIsNuovoUtenteOpen(true)}>
          + Nuovo Utente
        </Button>
      </div>

      {caricamento && (
        <div className="text-center py-4">
          <Spinner active label="Caricamento utenti..." />
        </div>
      )}

      {errore && <Alert color="danger">{errore}</Alert>}

      {/* Tabella utenti */}
      {!caricamento && !errore && (
        <Table responsive hover striped aria-label="Lista utenti">
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Nome</th>
              <th scope="col">Email</th>
              <th scope="col">Ruoli</th>
              <th scope="col">Stato</th>
              <th scope="col">Ultimo Accesso</th>
              <th scope="col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {utentiFiltrati.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">Nessun utente trovato</td>
              </tr>
            ) : (
              utentiFiltrati.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{`${u.nome} ${u.cognome}`.trim()}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.ruoli?.map((r) => (
                      <Badge key={r} color="primary" pill className="me-1">
                        {r}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <Badge color={u.abilitato ? 'success' : 'danger'} pill>
                      {u.abilitato ? 'Attivo' : 'Disabilitato'}
                    </Badge>
                  </td>
                  <td>
                    {u.ultimoAccesso
                      ? new Date(u.ultimoAccesso).toLocaleDateString('it-IT')
                      : '-'}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <Button
                        color="secondary"
                        size="sm"
                        outline
                        onClick={() => { setUtenteSelezionato(u); setIsDettaglioOpen(true); }}
                      >
                        Dettaglio
                      </Button>
                      <Button
                        color="secondary"
                        size="sm"
                        outline
                        onClick={() => {
                          setUtenteSelezionato(u);
                          setRuoliSelezionati(u.ruoli ?? []);
                          setIsModificaRuoliOpen(true);
                        }}
                      >
                        Modifica Ruoli
                      </Button>
                      <Button
                        color={u.abilitato ? 'warning' : 'success'}
                        size="sm"
                        disabled={operazioneInCorso}
                        onClick={() => toggleAbilitazione(u)}
                      >
                        {u.abilitato ? 'Disabilita' : 'Abilita'}
                      </Button>
                      <Button
                        color="secondary"
                        size="sm"
                        outline
                        disabled={operazioneInCorso}
                        onClick={() => resetPassword(u)}
                      >
                        Reset Pwd
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal dettaglio utente */}
      <Modal
        isOpen={isDettaglioOpen}
        toggle={() => setIsDettaglioOpen(false)}
        labelledBy="modal-dettaglio-utente-title"
        size="lg"
      >
        <ModalHeader toggle={() => setIsDettaglioOpen(false)} id="modal-dettaglio-utente-title">
          Dettaglio Utente: {utenteSelezionato?.username}
        </ModalHeader>
        <ModalBody>
          {utenteSelezionato && (
            <dl className="row">
              <dt className="col-sm-4">ID:</dt>
              <dd className="col-sm-8">{utenteSelezionato.id}</dd>
              <dt className="col-sm-4">Username:</dt>
              <dd className="col-sm-8">{utenteSelezionato.username}</dd>
              <dt className="col-sm-4">Nome:</dt>
              <dd className="col-sm-8">{utenteSelezionato.nome}</dd>
              <dt className="col-sm-4">Cognome:</dt>
              <dd className="col-sm-8">{utenteSelezionato.cognome}</dd>
              <dt className="col-sm-4">Email:</dt>
              <dd className="col-sm-8">{utenteSelezionato.email}</dd>
              <dt className="col-sm-4">Ruoli:</dt>
              <dd className="col-sm-8">{utenteSelezionato.ruoli?.join(', ')}</dd>
              <dt className="col-sm-4">Stato:</dt>
              <dd className="col-sm-8">{utenteSelezionato.abilitato ? 'Attivo' : 'Disabilitato'}</dd>
              <dt className="col-sm-4">Ultimo Accesso:</dt>
              <dd className="col-sm-8">
                {utenteSelezionato.ultimoAccesso
                  ? new Date(utenteSelezionato.ultimoAccesso).toLocaleString('it-IT')
                  : '-'}
              </dd>
            </dl>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setIsDettaglioOpen(false)}>Chiudi</Button>
        </ModalFooter>
      </Modal>

      {/* Modal modifica ruoli */}
      <Modal
        isOpen={isModificaRuoliOpen}
        toggle={() => setIsModificaRuoliOpen(false)}
        labelledBy="modal-modifica-ruoli-title"
        size="sm"
      >
        <ModalHeader toggle={() => setIsModificaRuoliOpen(false)} id="modal-modifica-ruoli-title">
          Modifica Ruoli: {utenteSelezionato?.username}
        </ModalHeader>
        <ModalBody>
          <p>Seleziona i ruoli per l'utente <strong>{utenteSelezionato?.username}</strong>:</p>
          {RUOLI_DISPONIBILI.map((r) => (
            <FormGroup check key={r}>
              <Input
                id={`ruolo-${r}`}
                type="checkbox"
                checked={ruoliSelezionati.includes(r)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setRuoliSelezionati(
                    e.target.checked
                      ? [...ruoliSelezionati, r]
                      : ruoliSelezionati.filter((x) => x !== r)
                  );
                }}
                noWrapper
              />
              <Label check for={`ruolo-${r}`}>{r}</Label>
            </FormGroup>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={operazioneInCorso} onClick={salvaRuoli}>
            Salva
          </Button>
          <Button color="secondary" outline onClick={() => setIsModificaRuoliOpen(false)}>
            Annulla
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal nuovo utente */}
      <Modal
        isOpen={isNuovoUtenteOpen}
        toggle={() => setIsNuovoUtenteOpen(false)}
        labelledBy="modal-nuovo-utente-title"
        size="lg"
      >
        <ModalHeader toggle={() => setIsNuovoUtenteOpen(false)} id="modal-nuovo-utente-title">
          Nuovo Utente
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Input
              id="nuUsername"
              label="Username *"
              value={nuovoUtente.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovoUtente({ ...nuovoUtente, username: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="nuNome"
              label="Nome *"
              value={nuovoUtente.nome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovoUtente({ ...nuovoUtente, nome: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="nuCognome"
              label="Cognome *"
              value={nuovoUtente.cognome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovoUtente({ ...nuovoUtente, cognome: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="nuEmail"
              type="email"
              label="Email *"
              value={nuovoUtente.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovoUtente({ ...nuovoUtente, email: e.target.value })
              }
            />
          </FormGroup>
          <div>
            <Label for="nuRuolo">Ruolo iniziale *</Label>
            <Input
              id="nuRuolo"
              type="select"
              value={nuovoUtente.ruolo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovoUtente({ ...nuovoUtente, ruolo: e.target.value })
              }
              aria-label="Ruolo iniziale"
              noWrapper
            >
              {RUOLI_DISPONIBILI.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Input>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={operazioneInCorso} onClick={creaNuovoUtente}>
            Crea
          </Button>
          <Button color="secondary" outline onClick={() => setIsNuovoUtenteOpen(false)}>
            Annulla
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default UtentiAdmin;
