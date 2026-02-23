package it.gov.atti.governance;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entità JPA che rappresenta un evento di audit per la tracciabilità
 * di tutte le operazioni effettuate sugli atti amministrativi.
 */
@Entity
@Table(name = "audit_log")
public class AuditEvent extends PanacheEntityBase {

    /** Identificativo univoco dell'evento */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    /** ID dell'istanza del processo Kogito correlato */
    public String processInstanceId;

    /**
     * Tipo di evento registrato.
     * Esempi: PROCESSO_AVVIATO, TASK_COMPLETATO, ATTO_PUBBLICATO,
     *         STATO_AGGIORNATO, ACCESSO_NEGATO
     */
    public String eventType;

    /** ID dell'utente che ha generato l'evento (dal token JWT) */
    public String userId;

    /** Data e ora in cui si è verificato l'evento */
    public LocalDateTime timestamp;

    /** Dettagli aggiuntivi dell'evento in formato testuale o JSON */
    @Column(columnDefinition = "TEXT")
    public String details;
}
