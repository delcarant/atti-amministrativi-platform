import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
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

  // Modals
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
  const [messaggioOperazione, setMessaggioOperazione] = useState<{ tipo: 'success' | 'danger'; testo: string } | null>(null);
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
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Gestione Utenti
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

      {/* Toolbar */}
      <Toolbar style={{ marginBottom: '1rem' }}>
        <ToolbarContent>
          <ToolbarItem>
            <FormSelect
              value={filtroRuolo}
              onChange={(_e, v) => setFiltroRuolo(v)}
              aria-label="Filtra per ruolo"
            >
              <FormSelectOption value="TUTTI" label="TUTTI" />
              {RUOLI_DISPONIBILI.map((r) => <FormSelectOption key={r} value={r} label={r} />)}
            </FormSelect>
          </ToolbarItem>
          <ToolbarItem>
            <FormSelect
              value={filtroStato}
              onChange={(_e, v) => setFiltroStato(v)}
              aria-label="Filtra per stato"
            >
              {STATI_UTENTE.map((s) => <FormSelectOption key={s} value={s} label={s} />)}
            </FormSelect>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary" onClick={() => setIsNuovoUtenteOpen(true)}>
              + Nuovo Utente
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {/* Stato caricamento o errore */}
      {caricamento && <Spinner aria-label="Caricamento utenti" size="xl" />}
      {errore && (
        <Alert variant="danger" title="Errore caricamento utenti" isInline>
          {errore}
        </Alert>
      )}

      {/* Tabella utenti */}
      {!caricamento && !errore && (
        <Table aria-label="Lista utenti">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Nome</Th>
              <Th>Email</Th>
              <Th>Ruoli</Th>
              <Th>Stato</Th>
              <Th>Ultimo Accesso</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {utentiFiltrati.length === 0 ? (
              <Tr><Td colSpan={7}>Nessun utente trovato</Td></Tr>
            ) : (
              utentiFiltrati.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.username}</Td>
                  <Td>{`${u.nome} ${u.cognome}`.trim()}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    {u.ruoli?.map((r) => (
                      <span
                        key={r}
                        style={{ backgroundColor: '#06c', color: '#fff', padding: '1px 6px', borderRadius: '10px', marginRight: '4px', fontSize: '0.75rem' }}
                      >
                        {r}
                      </span>
                    ))}
                  </Td>
                  <Td>
                    <span style={{ color: u.abilitato ? '#3e8635' : '#c9190b', fontWeight: 'bold' }}>
                      {u.abilitato ? 'Attivo' : 'Disabilitato'}
                    </span>
                  </Td>
                  <Td>{u.ultimoAccesso ? new Date(u.ultimoAccesso).toLocaleDateString('it-IT') : '-'}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button variant="secondary" size="sm" onClick={() => { setUtenteSelezionato(u); setIsDettaglioOpen(true); }}>
                        Dettaglio
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setUtenteSelezionato(u); setRuoliSelezionati(u.ruoli ?? []); setIsModificaRuoliOpen(true); }}
                      >
                        Modifica Ruoli
                      </Button>
                      <Button
                        variant={u.abilitato ? 'warning' : 'primary'}
                        size="sm"
                        isDisabled={operazioneInCorso}
                        onClick={() => toggleAbilitazione(u)}
                      >
                        {u.abilitato ? 'Disabilita' : 'Abilita'}
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        isDisabled={operazioneInCorso}
                        onClick={() => resetPassword(u)}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}

      {/* Modal dettaglio utente */}
      <Modal
        variant={ModalVariant.medium}
        title={`Dettaglio Utente: ${utenteSelezionato?.username}`}
        isOpen={isDettaglioOpen}
        onClose={() => setIsDettaglioOpen(false)}
        actions={[
          <Button key="chiudi" variant="primary" onClick={() => setIsDettaglioOpen(false)}>Chiudi</Button>,
        ]}
      >
        {utenteSelezionato && (
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem 1rem' }}>
            <dt><strong>ID:</strong></dt><dd>{utenteSelezionato.id}</dd>
            <dt><strong>Username:</strong></dt><dd>{utenteSelezionato.username}</dd>
            <dt><strong>Nome:</strong></dt><dd>{utenteSelezionato.nome}</dd>
            <dt><strong>Cognome:</strong></dt><dd>{utenteSelezionato.cognome}</dd>
            <dt><strong>Email:</strong></dt><dd>{utenteSelezionato.email}</dd>
            <dt><strong>Ruoli:</strong></dt><dd>{utenteSelezionato.ruoli?.join(', ')}</dd>
            <dt><strong>Stato:</strong></dt><dd>{utenteSelezionato.abilitato ? 'Attivo' : 'Disabilitato'}</dd>
            <dt><strong>Ultimo Accesso:</strong></dt>
            <dd>{utenteSelezionato.ultimoAccesso ? new Date(utenteSelezionato.ultimoAccesso).toLocaleString('it-IT') : '-'}</dd>
          </dl>
        )}
      </Modal>

      {/* Modal modifica ruoli */}
      <Modal
        variant={ModalVariant.small}
        title={`Modifica Ruoli: ${utenteSelezionato?.username}`}
        isOpen={isModificaRuoliOpen}
        onClose={() => setIsModificaRuoliOpen(false)}
        actions={[
          <Button key="salva" variant="primary" isDisabled={operazioneInCorso} onClick={salvaRuoli}>
            Salva
          </Button>,
          <Button key="annulla" variant="link" onClick={() => setIsModificaRuoliOpen(false)}>Annulla</Button>,
        ]}
      >
        <p>Seleziona i ruoli per l'utente <strong>{utenteSelezionato?.username}</strong>:</p>
        {RUOLI_DISPONIBILI.map((r) => (
          <div key={r} style={{ marginBottom: '0.5rem' }}>
            <Checkbox
              id={`ruolo-${r}`}
              label={r}
              isChecked={ruoliSelezionati.includes(r)}
              onChange={(_e, checked) => {
                setRuoliSelezionati(
                  checked
                    ? [...ruoliSelezionati, r]
                    : ruoliSelezionati.filter((x) => x !== r)
                );
              }}
            />
          </div>
        ))}
      </Modal>

      {/* Modal nuovo utente */}
      <Modal
        variant={ModalVariant.medium}
        title="Nuovo Utente"
        isOpen={isNuovoUtenteOpen}
        onClose={() => setIsNuovoUtenteOpen(false)}
        actions={[
          <Button key="crea" variant="primary" isDisabled={operazioneInCorso} onClick={creaNuovoUtente}>
            Crea
          </Button>,
          <Button key="annulla" variant="link" onClick={() => setIsNuovoUtenteOpen(false)}>Annulla</Button>,
        ]}
      >
        <FormGroup label="Username" isRequired fieldId="nu-username">
          <TextInput id="nu-username" value={nuovoUtente.username} onChange={(_e, v) => setNuovoUtente({ ...nuovoUtente, username: v })} />
        </FormGroup>
        <FormGroup label="Nome" isRequired fieldId="nu-nome">
          <TextInput id="nu-nome" value={nuovoUtente.nome} onChange={(_e, v) => setNuovoUtente({ ...nuovoUtente, nome: v })} />
        </FormGroup>
        <FormGroup label="Cognome" isRequired fieldId="nu-cognome">
          <TextInput id="nu-cognome" value={nuovoUtente.cognome} onChange={(_e, v) => setNuovoUtente({ ...nuovoUtente, cognome: v })} />
        </FormGroup>
        <FormGroup label="Email" isRequired fieldId="nu-email">
          <TextInput id="nu-email" type="email" value={nuovoUtente.email} onChange={(_e, v) => setNuovoUtente({ ...nuovoUtente, email: v })} />
        </FormGroup>
        <FormGroup label="Ruolo iniziale" isRequired fieldId="nu-ruolo">
          <FormSelect
            id="nu-ruolo"
            value={nuovoUtente.ruolo}
            onChange={(_e, v) => setNuovoUtente({ ...nuovoUtente, ruolo: v })}
            aria-label="Ruolo iniziale"
          >
            {RUOLI_DISPONIBILI.map((r) => <FormSelectOption key={r} value={r} label={r} />)}
          </FormSelect>
        </FormGroup>
      </Modal>
    </PageSection>
  );
};

export default UtentiAdmin;
