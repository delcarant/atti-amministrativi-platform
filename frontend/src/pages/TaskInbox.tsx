import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
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

  const ruoloUtente = keycloak.tokenParsed?.realm_access?.roles?.find(
    (r: string) => ['istruttore', 'ragioniere', 'dirigente', 'admin'].includes(r)
  );

  const caricaTask = () => {
    axios
      .get(`/q/graphql`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
        params: {
          query: `{ UserTaskInstances(where: { potentialGroups: { contains: "${ruoloUtente}" } }) { id name processInstanceId actualOwner } }`,
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
      });
  };

  useEffect(() => {
    if (keycloak.token && ruoloUtente) {
      caricaTask();
    }
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
    <PageSection>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '1rem' }}>
        Task Inbox {ruoloUtente ? `(${ruoloUtente})` : ''}
      </Title>

      <Table aria-label="Lista task">
        <Thead>
          <Tr>
            <Th>ID Task</Th>
            <Th>Nome</Th>
            <Th>Processo</Th>
            <Th>Assegnato a</Th>
            <Th>Azioni</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.length === 0 ? (
            <Tr>
              <Td colSpan={5}>Nessun task disponibile</Td>
            </Tr>
          ) : (
            tasks.map((t) => (
              <Tr key={t.id}>
                <Td>{t.id}</Td>
                <Td>{t.name}</Td>
                <Td>{t.processInstanceId}</Td>
                <Td>{t.actualOwner ?? '-'}</Td>
                <Td>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setTaskSelezionato(t);
                      setIsModalOpen(true);
                    }}
                  >
                    Completa
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal
        variant={ModalVariant.small}
        title={`Completa Task: ${taskSelezionato?.name}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={[
          <Button
            key="completa"
            variant="primary"
            onClick={() => taskSelezionato && completaTask(taskSelezionato)}
          >
            Conferma Completamento
          </Button>,
          <Button key="annulla" variant="link" onClick={() => setIsModalOpen(false)}>
            Annulla
          </Button>,
        ]}
      >
        <p>Sei sicuro di voler completare il task <strong>{taskSelezionato?.name}</strong>?</p>
        <p>Processo: {taskSelezionato?.processInstanceId}</p>
      </Modal>
    </PageSection>
  );
};

export default TaskInbox;
