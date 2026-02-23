package it.gov.atti.services;

import it.gov.atti.model.Determinazione;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

/**
 * Servizio applicativo per la gestione delle determinazioni dirigenziali.
 * Contiene la logica di business per creazione, aggiornamento e ricerca.
 */
@ApplicationScoped
public class DeterminazioneService {

    /**
     * Crea una nuova determinazione con stato iniziale BOZZA.
     *
     * @param determinazione dati della nuova determinazione
     * @return la determinazione salvata con ID assegnato
     */
    @Transactional
    public Determinazione crea(Determinazione determinazione) {
        determinazione.stato = "BOZZA";
        determinazione.dataCreazione = LocalDateTime.now();
        determinazione.numero = generaNumerazione();
        determinazione.persist();
        return determinazione;
    }

    /**
     * Recupera tutte le determinazioni ordinate per data di creazione decrescente.
     *
     * @return lista di tutte le determinazioni
     */
    public List<Determinazione> trovaTutte() {
        return Determinazione.listAll();
    }

    /**
     * Recupera una determinazione per ID.
     *
     * @param id identificativo della determinazione
     * @return la determinazione trovata oppure null
     */
    public Determinazione trovaPerId(Long id) {
        return Determinazione.findById(id);
    }

    /**
     * Aggiorna lo stato di una determinazione.
     *
     * @param id    identificativo della determinazione
     * @param stato nuovo stato da impostare
     * @return la determinazione aggiornata
     */
    @Transactional
    public Determinazione aggiornaStato(Long id, String stato) {
        Determinazione det = Determinazione.findById(id);
        if (det == null) {
            throw new IllegalArgumentException("Determinazione non trovata: " + id);
        }
        det.stato = stato;
        if ("PUBBLICATA".equals(stato)) {
            det.dataPubblicazione = LocalDateTime.now();
        }
        return det;
    }

    /**
     * Genera il numero progressivo della determinazione nel formato DET-YYYY-NNN.
     *
     * @return numero generato
     */
    private String generaNumerazione() {
        int anno = Year.now().getValue();
        long contatore = Determinazione.count("EXTRACT(YEAR FROM dataCreazione) = ?1", anno) + 1;
        return String.format("DET-%d-%03d", anno, contatore);
    }
}
