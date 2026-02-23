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

/** Struttura dati di una determinazione */
interface Determinazione {
  id: number;
  numero: string;
  oggetto: string;
  importo: number;
  dirigente: string;
  stato: string;
  dataCreazione: string;
}

/** Stati possibili di una determinazione */
const STATI = ['TUTTI', 'BOZZA', 'ISTRUTTORIA', 'VISTO_CONTABILE', 'FIRMATA', 'PUBBLICATA', 'RIFIUTATA'];

/** Restituisce il colore del badge in base allo stato */
const coloreBadgeStato = (stato: string): string => {
  switch (stato) {
    case 'PUBBLICATA': return 'success';
    case 'FIRMATA': return 'primary';
    case 'ISTRUTTORIA':
    case 'VISTO_CONTABILE': return 'warning';
    case 'BOZZA': return 'secondary';
    case 'RIFIUTATA': return 'danger';
    default: return 'secondary';
  }
};

/**
 * Pagina con la lista di tutte le determinazioni dirigenziali.
 * Permette filtraggio per stato e creazione di nuove determinazioni.
 */
const AttiList: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [determinazioni, setDeterminazioni] = useState<Determinazione[]>([]);
  const [filtroStato, setFiltroStato] = useState('TUTTI');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [nuovaDet, setNuovaDet] = useState({
    oggetto: '',
    importo: '',
    centroSpesa: '',
    livelloDirigente: 'D1',
  });

  const caricaDeterminazioni = () => {
    setCaricamento(true);
    axios
      .get('/determinazioni', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setDeterminazioni(res.data))
      .catch((err) => setErrore(err.message ?? 'Errore caricamento'))
      .finally(() => setCaricamento(false));
  };

  useEffect(() => {
    caricaDeterminazioni();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak.token]);

  const determinazioniFiltrate =
    filtroStato === 'TUTTI'
      ? determinazioni
      : determinazioni.filter((d) => d.stato === filtroStato);

  const creaDeterminazione = () => {
    axios
      .post(
        '/determinazioni',
        { ...nuovaDet, importo: parseFloat(nuovaDet.importo) },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => {
        setIsModalOpen(false);
        caricaDeterminazioni();
      })
      .catch(console.error);
  };

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">Determinazioni Dirigenziali</h1>

      {errore && (
        <Alert color="danger" className="mb-3">
          {errore}
        </Alert>
      )}

      {/* Barra filtri */}
      <div className="d-flex gap-2 align-items-end mb-3 flex-wrap">
        <div>
          <Label for="filtroStato" className="me-1">Filtra per stato:</Label>
          <Input
            id="filtroStato"
            type="select"
            value={filtroStato}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroStato(e.target.value)}
            aria-label="Filtra per stato"
            noWrapper
          >
            {STATI.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Input>
        </div>
        <Button color="primary" onClick={() => setIsModalOpen(true)}>
          Nuova Determinazione
        </Button>
      </div>

      {caricamento && (
        <div className="text-center py-4">
          <Spinner active label="Caricamento determinazioni..." />
        </div>
      )}

      {!caricamento && (
        <Table responsive hover striped aria-label="Lista determinazioni">
          <thead>
            <tr>
              <th scope="col">Numero</th>
              <th scope="col">Oggetto</th>
              <th scope="col">Importo (€)</th>
              <th scope="col">Dirigente</th>
              <th scope="col">Stato</th>
              <th scope="col">Data Creazione</th>
            </tr>
          </thead>
          <tbody>
            {determinazioniFiltrate.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-3">
                  Nessuna determinazione trovata
                </td>
              </tr>
            ) : (
              determinazioniFiltrate.map((d) => (
                <tr key={d.id}>
                  <td>{d.numero}</td>
                  <td>{d.oggetto}</td>
                  <td>{d.importo?.toLocaleString('it-IT')}</td>
                  <td>{d.dirigente}</td>
                  <td>
                    <Badge color={coloreBadgeStato(d.stato)} pill>
                      {d.stato}
                    </Badge>
                  </td>
                  <td>
                    {d.dataCreazione
                      ? new Date(d.dataCreazione).toLocaleDateString('it-IT')
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal creazione nuova determinazione */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        labelledBy="modal-nuova-det-title"
        size="lg"
      >
        <ModalHeader toggle={() => setIsModalOpen(false)} id="modal-nuova-det-title">
          Nuova Determinazione Dirigenziale
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Input
              id="oggetto"
              label="Oggetto *"
              value={nuovaDet.oggetto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovaDet({ ...nuovaDet, oggetto: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="importo"
              type="number"
              label="Importo (€) *"
              value={nuovaDet.importo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovaDet({ ...nuovaDet, importo: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="centroSpesa"
              label="Centro di Spesa *"
              value={nuovaDet.centroSpesa}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovaDet({ ...nuovaDet, centroSpesa: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="livelloDirigente">Livello Dirigente *</Label>
            <Input
              id="livelloDirigente"
              type="select"
              value={nuovaDet.livelloDirigente}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNuovaDet({ ...nuovaDet, livelloDirigente: e.target.value })
              }
              aria-label="Livello Dirigente"
              noWrapper
            >
              <option value="D1">D1</option>
              <option value="D2">D2</option>
              <option value="D3">D3</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={creaDeterminazione}>
            Crea
          </Button>
          <Button color="secondary" outline onClick={() => setIsModalOpen(false)}>
            Annulla
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default AttiList;
