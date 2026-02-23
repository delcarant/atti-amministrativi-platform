package it.gov.atti.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Entità JPA che rappresenta una determinazione dirigenziale.
 * Mappata sulla tabella 'determinazioni' nel database PostgreSQL.
 */
@Entity
@Table(name = "determinazioni")
public class Determinazione extends PanacheEntity {

    /** Oggetto della determinazione */
    public String oggetto;

    /** Importo finanziario della determinazione */
    public Double importo;

    /** Centro di spesa di riferimento */
    public String centroSpesa;

    /** Nome del dirigente responsabile */
    public String dirigente;

    /** Livello del dirigente: D1, D2, D3 */
    public String livelloDirigente;

    /**
     * Stato corrente della determinazione.
     * Valori possibili: BOZZA, ISTRUTTORIA, VISTO_CONTABILE, FIRMATA, PUBBLICATA, RIFIUTATA
     */
    public String stato;

    /** Data e ora di creazione della determinazione */
    public LocalDateTime dataCreazione;

    /** Data e ora di pubblicazione all'albo pretorio */
    public LocalDateTime dataPubblicazione;

    /** ID dell'istanza del processo Kogito associato */
    public String processInstanceId;

    /** Numero identificativo della determinazione, es. DET-2026-001 */
    public String numero;
}
