import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from 'design-react-kit';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

/** Struttura dati di un task Kogito */
interface Task {
  id: string;
  name: string;
  processInstanceId: string;
  actualOwner?: string;
  potentialGroups?: string[];
  taskData?: Record<string, unknown>;
}

/**
 * Pagina Task Inbox: mostra i task Kogito assegnati all'utente corrente.
 * Permette di completare i task in base al ruolo dell'utente.
 */
const TaskInbox: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSelezionato, setTaskSelezionato] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caricamento, setCaricamento] = useState(false);

  const ruoloUtente = keycloak.tokenParsed?.realm_access?.roles?.find(
    (r: string) => ['istruttore', 'ragioniere', 'dirigente', 'admin'].includes(r)
  );

  const caricaTask = () => {
    setCaricamento(true);
    const safeRuolo = (ruoloUtente ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
    axios
      .get(`/q/graphql`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
        params: {
          query: `{ UserTaskInstances(where: { potentialGroups: { contains: "${safeRuolo}" } }) { id name processInstanceId actualOwner } }`,
        },
      })
      .then((res) => setTasks(res.data?.data?.UserTaskInstances ?? []))
      .catch(() => {
        // Fallback: endpoint REST alternativo
        axios
          .get('/api/tasks', {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          })
          .then((r) => setTasks(r.data ?? []))
          .catch(console.error);
      })
      .finally(() => setCaricamento(false));
  };

  useEffect(() => {
    if (keycloak.token && ruoloUtente) {
      caricaTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak.token, ruoloUtente]);

  const completaTask = (task: Task) => {
    axios
      .post(
        `/determinazioni/${task.processInstanceId}/tasks/${task.id}`,
        { completato: true },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      )
      .then(() => {
        setIsModalOpen(false);
        caricaTask();
      })
      .catch(console.error);
  };

  return (
    <Container className="py-4">
      <h1 className="h3 mb-4">
        Task Inbox{' '}
        {ruoloUtente && (
          <Badge color="primary" pill className="ms-2">
            {ruoloUtente}
          </Badge>
        )}
      </h1>

      {caricamento && (
        <div className="text-center py-4">
          <Spinner active label="Caricamento task..." />
        </div>
      )}

      {!caricamento && (
        <Table responsive hover striped aria-label="Lista task">
          <thead>
            <tr>
              <th scope="col">ID Task</th>
              <th scope="col">Nome</th>
              <th scope="col">Processo</th>
              <th scope="col">Assegnato a</th>
              <th scope="col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-3">
                  Nessun task disponibile
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.processInstanceId}</td>
                  <td>{t.actualOwner ?? '-'}</td>
                  <td>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => {
                        setTaskSelezionato(t);
                        setIsModalOpen(true);
                      }}
                    >
                      Completa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal conferma completamento task */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        labelledBy="modal-task-title"
        size="sm"
      >
        <ModalHeader toggle={() => setIsModalOpen(false)} id="modal-task-title">
          Completa Task: {taskSelezionato?.name}
        </ModalHeader>
        <ModalBody>
          <p>
            Sei sicuro di voler completare il task{' '}
            <strong>{taskSelezionato?.name}</strong>?
          </p>
          <p>Processo: {taskSelezionato?.processInstanceId}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => taskSelezionato && completaTask(taskSelezionato)}
          >
            Conferma Completamento
          </Button>
          <Button color="secondary" outline onClick={() => setIsModalOpen(false)}>
            Annulla
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default TaskInbox;
