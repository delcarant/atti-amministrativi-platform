import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Container,
  FormGroup,
  Input,
  Label,
  Pager,
  Spinner,
  Table,
} from 'design-react-kit';
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

/** Restituisce il colore del badge per tipo evento */
const coloreTipoEvento = (tipo: string): string => {
  switch (tipo) {
    case 'ATTO_PUBBLICATO': return 'success';
    case 'ATTO_RIFIUTATO':
    case 'ERRORE': return 'danger';
    case 'PROCESSO_AVVIATO': return 'primary';
    case 'TASK_COMPLETATO': return 'info';
    default: return 'secondary';
  }
};

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

  const totalePagine = Math.ceil(totale / pageSize) || 1;

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
    <Container className="py-4">
      <h1 className="h3 mb-4">Audit Log</h1>

      {/* Barra filtri avanzati */}
      <div className="d-flex gap-2 align-items-end mb-3 flex-wrap">
        <FormGroup>
          <Input
            id="auditTesto"
            label="Cerca"
            placeholder="Cerca in tutti i campi..."
            value={testoRicerca}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestoRicerca(e.target.value)}
          />
        </FormGroup>
        <div>
          <Label for="auditTipoEvento">Tipo evento</Label>
          <Input
            id="auditTipoEvento"
            type="select"
            value={tipoEvento}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTipoEvento(e.target.value)}
            aria-label="Tipo evento"
            noWrapper
          >
            {TIPI_EVENTO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Input>
        </div>
        <FormGroup>
          <Input
            id="auditUtente"
            label="Utente"
            placeholder="Filtra per utente"
            value={filtroUtente}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroUtente(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Input
            id="auditDa"
            type="date"
            label="Da"
            value={filtroDa}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroDa(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Input
            id="auditA"
            type="date"
            label="A"
            value={filtroA}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroA(e.target.value)}
          />
        </FormGroup>
        <div>
          <Label for="auditPageSize">Righe/pag.</Label>
          <Input
            id="auditPageSize"
            type="select"
            value={pageSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const dim = Number(e.target.value);
              setPageSize(dim);
              setFiltriApplicati({ ...filtriApplicati, pageSize: dim, page: 1 });
            }}
            aria-label="Righe per pagina"
            noWrapper
          >
            {PAGE_SIZES.map((dim) => (
              <option key={dim} value={dim}>{dim} per pagina</option>
            ))}
          </Input>
        </div>
        <div className="d-flex gap-2">
          <Button color="primary" onClick={applicaFiltri}>Applica</Button>
          <Button color="secondary" outline onClick={reimpostaFiltri}>Reimposta</Button>
          <Button color="secondary" outline disabled={eventi.length === 0} onClick={esportaCSV}>
            ⬇ Esporta CSV
          </Button>
        </div>
      </div>

      {caricamento && (
        <div className="text-center py-4">
          <Spinner active label="Caricamento audit log..." />
        </div>
      )}

      {errore && (
        <Alert color="danger">{errore}</Alert>
      )}

      {/* Tabella eventi */}
      {!caricamento && !errore && (
        <>
          <Table responsive hover striped aria-label="Audit Log">
            <thead>
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">Tipo Evento</th>
                <th scope="col">ID Processo</th>
                <th scope="col">Utente</th>
                <th scope="col">Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {eventi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-3">Nessun evento trovato</td>
                </tr>
              ) : (
                eventi.map((e) => (
                  <tr key={e.id}>
                    <td>{e.timestamp ? new Date(e.timestamp).toLocaleString('it-IT') : '-'}</td>
                    <td>
                      <Badge color={coloreTipoEvento(e.tipoEvento)} pill>
                        {e.tipoEvento}
                      </Badge>
                    </td>
                    <td>{e.processoId ?? '-'}</td>
                    <td>{e.utente}</td>
                    <td>{e.dettagli}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Paginazione */}
          {totalePagine > 1 && (
            <Pager
              aria-label="Paginazione audit log"
              className="mt-3"
              listClassName="justify-content-center"
            >
              <li className="page-item">
                <button
                  className="page-link"
                  disabled={page <= 1}
                  onClick={() => {
                    const nuovaPagina = page - 1;
                    setPage(nuovaPagina);
                    setFiltriApplicati({ ...filtriApplicati, page: nuovaPagina });
                  }}
                  aria-label="Pagina precedente"
                >
                  «
                </button>
              </li>
              <li className="page-item active">
                <span className="page-link">
                  Pagina {page} di {totalePagine}
                </span>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  disabled={page >= totalePagine}
                  onClick={() => {
                    const nuovaPagina = page + 1;
                    setPage(nuovaPagina);
                    setFiltriApplicati({ ...filtriApplicati, page: nuovaPagina });
                  }}
                  aria-label="Pagina successiva"
                >
                  »
                </button>
              </li>
            </Pager>
          )}
        </>
      )}
    </Container>
  );
};

export default AuditLogAdmin;
