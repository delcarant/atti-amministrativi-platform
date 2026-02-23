import React, { useState } from 'react';
import {
  Alert,
  Button,
  FormGroup,
  FormSelect,
  FormSelectOption,
  PageSection,
  Pagination,
  Spinner,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useAuditLog, AuditFilter } from '../../hooks/useAdmin';

/** Tipi evento disponibili per il filtro */
const TIPI_EVENTO = [
  'TUTTI',
  'PROCESSO_AVVIATO',
  'TASK_COMPLETATO',
  'ATTO_PUBBLICATO',
  'ATTO_RIFIUTATO',
  'LOGIN',
  'LOGOUT',
  'ERRORE',
];

/** Opzioni page size per la paginazione */
const PAGE_SIZES = [10, 25, 50, 100];

/**
 * Pagina di visualizzazione e ricerca del log di audit.
 * Permette di filtrare per testo libero, tipo evento, utente e data.
 * Supporta paginazione con page size configurabile ed esportazione CSV.
 */
const AuditLogAdmin: React.FC = () => {
  // Stato filtri UI
  const [testoRicerca, setTestoRicerca] = useState('');
  const [tipoEvento, setTipoEvento] = useState('TUTTI');
  const [filtroUtente, setFiltroUtente] = useState('');
  const [filtroDa, setFiltroDa] = useState('');
  const [filtroA, setFiltroA] = useState('');

  // Stato paginazione
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtri applicati per il fetch
  const [filtriApplicati, setFiltriApplicati] = useState<AuditFilter>({ page: 1, pageSize: 10 });

  const { eventi, totale, caricamento, errore } = useAuditLog(filtriApplicati);

  /** Applica i filtri correnti e torna alla prima pagina */
  const applicaFiltri = () => {
    const nuoviFiltri: AuditFilter = {
      testo: testoRicerca || undefined,
      tipoEvento: tipoEvento !== 'TUTTI' ? tipoEvento : undefined,
      utente: filtroUtente || undefined,
      dataDa: filtroDa || undefined,
      dataA: filtroA || undefined,
      page: 1,
      pageSize,
    };
    setPage(1);
    setFiltriApplicati(nuoviFiltri);
  };

  /** Reimposta tutti i filtri */
  const reimpostaFiltri = () => {
    setTestoRicerca('');
    setTipoEvento('TUTTI');
    setFiltroUtente('');
    setFiltroDa('');
    setFiltroA('');
    setPage(1);
    setFiltriApplicati({ page: 1, pageSize });
  };

  /** Cambia la pagina corrente */
  const cambiaPagina = (_evt: React.MouseEvent | React.KeyboardEvent | MouseEvent, nuovaPagina: number) => {
    setPage(nuovaPagina);
    setFiltriApplicati({ ...filtriApplicati, page: nuovaPagina });
  };

  /** Esporta il log filtrato come CSV */
  const esportaCSV = () => {
    const intestazione = 'ID,Timestamp,Tipo Evento,ID Processo,Utente,Dettagli\n';
    const righe = eventi
      .map((e) =>
        [e.id, `"${e.timestamp}"`, `"${e.tipoEvento}"`, `"${e.processoId}"`, `"${e.utente}"`, `"${e.dettagli}"`].join(',')
      )
      .join('\n');
    const blob = new Blob([intestazione + righe], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Audit Log
      </Title>

      {/* Toolbar con filtri avanzati */}
      <Toolbar style={{ marginBottom: '1rem' }}>
        <ToolbarContent>
          <ToolbarItem>
            <TextInput
              placeholder="Cerca in tutti i campi..."
              value={testoRicerca}
              onChange={(_e, v) => setTestoRicerca(v)}
              aria-label="Ricerca testo libero"
            />
          </ToolbarItem>
          <ToolbarItem>
            <FormSelect
              value={tipoEvento}
              onChange={(_e, v) => setTipoEvento(v)}
              aria-label="Tipo evento"
            >
              {TIPI_EVENTO.map((t) => (
                <FormSelectOption key={t} value={t} label={t} />
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
            <FormGroup label="Da" fieldId="auditDa">
              <TextInput
                id="auditDa"
                type="date"
                value={filtroDa}
                onChange={(_e, v) => setFiltroDa(v)}
                aria-label="Data da"
              />
            </FormGroup>
          </ToolbarItem>
          <ToolbarItem>
            <FormGroup label="A" fieldId="auditA">
              <TextInput
                id="auditA"
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
          <ToolbarItem>
            <Button variant="secondary" onClick={esportaCSV} isDisabled={eventi.length === 0}>
              ⬇️ Esporta CSV
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <FormSelect
              value={pageSize}
              onChange={(_e, v) => {
                const nuovaDim = Number(v);
                setPageSize(nuovaDim);
                setFiltriApplicati({ ...filtriApplicati, pageSize: nuovaDim, page: 1 });
              }}
              aria-label="Righe per pagina"
            >
              {PAGE_SIZES.map((dim) => (
                <FormSelectOption key={dim} value={dim} label={`${dim} per pagina`} />
              ))}
            </FormSelect>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {/* Stato caricamento o errore */}
      {caricamento && <Spinner aria-label="Caricamento audit log" size="xl" />}
      {errore && (
        <Alert variant="danger" title="Errore caricamento audit log" isInline>
          {errore}
        </Alert>
      )}

      {/* Tabella eventi */}
      {!caricamento && !errore && (
        <>
          <Table aria-label="Audit Log">
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>Tipo Evento</Th>
                <Th>ID Processo</Th>
                <Th>Utente</Th>
                <Th>Dettagli</Th>
              </Tr>
            </Thead>
            <Tbody>
              {eventi.length === 0 ? (
                <Tr>
                  <Td colSpan={5}>Nessun evento trovato</Td>
                </Tr>
              ) : (
                eventi.map((e) => (
                  <Tr
                    key={e.id}
                    style={
                      e.tipoEvento === 'ERRORE'
                        ? { backgroundColor: '#ffd7d7', color: '#c9190b' }
                        : undefined
                    }
                  >
                    <Td>{e.timestamp ? new Date(e.timestamp).toLocaleString('it-IT') : '-'}</Td>
                    <Td>{e.tipoEvento}</Td>
                    <Td>{e.processoId ?? '-'}</Td>
                    <Td>{e.utente}</Td>
                    <Td>{e.dettagli}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {/* Paginazione */}
          <Pagination
            itemCount={totale}
            perPage={pageSize}
            page={page}
            onSetPage={cambiaPagina}
            onPerPageSelect={(_evt, nuovaDim) => {
              setPageSize(nuovaDim);
              setFiltriApplicati({ ...filtriApplicati, pageSize: nuovaDim, page: 1 });
            }}
            perPageOptions={PAGE_SIZES.map((dim) => ({ title: `${dim}`, value: dim }))}
            style={{ marginTop: '1rem' }}
          />
        </>
      )}
    </PageSection>
  );
};

export default AuditLogAdmin;
