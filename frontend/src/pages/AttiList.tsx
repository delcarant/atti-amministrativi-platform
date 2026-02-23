import React, { useEffect, useState } from 'react';
import {
  Button,
  FormGroup,
  Modal,
  ModalVariant,
  PageSection,
  Select,
  SelectOption,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
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

/**
 * Pagina con la lista di tutte le determinazioni dirigenziali.
 * Permette filtraggio per stato e creazione di nuove determinazioni.
 */
const AttiList: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [determinazioni, setDeterminazioni] = useState<Determinazione[]>([]);
  const [filtroStato, setFiltroStato] = useState('TUTTI');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuovaDet, setNuovaDet] = useState({
    oggetto: '',
    importo: '',
    centroSpesa: '',
    livelloDirigente: 'D1',
  });

  const caricaDeterminazioni = () => {
    axios
      .get('/determinazioni', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setDeterminazioni(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    caricaDeterminazioni();
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
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Determinazioni Dirigenziali
      </Title>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Select
          isOpen={isSelectOpen}
          onToggle={setIsSelectOpen}
          onSelect={(_e, value) => {
            setFiltroStato(value as string);
            setIsSelectOpen(false);
          }}
          selections={filtroStato}
          aria-label="Filtra per stato"
        >
          {STATI.map((s) => (
            <SelectOption key={s} value={s} />
          ))}
        </Select>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Nuova Determinazione
        </Button>
      </div>

      <Table aria-label="Lista determinazioni">
        <Thead>
          <Tr>
            <Th>Numero</Th>
            <Th>Oggetto</Th>
            <Th>Importo (€)</Th>
            <Th>Dirigente</Th>
            <Th>Stato</Th>
            <Th>Data Creazione</Th>
          </Tr>
        </Thead>
        <Tbody>
          {determinazioniFiltrate.map((d) => (
            <Tr key={d.id}>
              <Td>{d.numero}</Td>
              <Td>{d.oggetto}</Td>
              <Td>{d.importo?.toLocaleString('it-IT')}</Td>
              <Td>{d.dirigente}</Td>
              <Td>{d.stato}</Td>
              <Td>{d.dataCreazione ? new Date(d.dataCreazione).toLocaleDateString('it-IT') : '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal
        variant={ModalVariant.medium}
        title="Nuova Determinazione Dirigenziale"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={[
          <Button key="crea" variant="primary" onClick={creaDeterminazione}>
            Crea
          </Button>,
          <Button key="annulla" variant="link" onClick={() => setIsModalOpen(false)}>
            Annulla
          </Button>,
        ]}
      >
        <FormGroup label="Oggetto" isRequired fieldId="oggetto">
          <TextInput
            id="oggetto"
            value={nuovaDet.oggetto}
            onChange={(_e, v) => setNuovaDet({ ...nuovaDet, oggetto: v })}
          />
        </FormGroup>
        <FormGroup label="Importo (€)" isRequired fieldId="importo">
          <TextInput
            id="importo"
            type="number"
            value={nuovaDet.importo}
            onChange={(_e, v) => setNuovaDet({ ...nuovaDet, importo: v })}
          />
        </FormGroup>
        <FormGroup label="Centro di Spesa" isRequired fieldId="centroSpesa">
          <TextInput
            id="centroSpesa"
            value={nuovaDet.centroSpesa}
            onChange={(_e, v) => setNuovaDet({ ...nuovaDet, centroSpesa: v })}
          />
        </FormGroup>
        <FormGroup label="Livello Dirigente" isRequired fieldId="livelloDirigente">
          <Select
            isOpen={false}
            onToggle={() => {}}
            onSelect={(_e, v) => setNuovaDet({ ...nuovaDet, livelloDirigente: v as string })}
            selections={nuovaDet.livelloDirigente}
            aria-label="Livello Dirigente"
          >
            <SelectOption value="D1" />
            <SelectOption value="D2" />
            <SelectOption value="D3" />
          </Select>
        </FormGroup>
      </Modal>
    </PageSection>
  );
};

export default AttiList;
