package it.gov.atti.ai.rag;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

/**
 * Servizio RAG (Retrieval-Augmented Generation) per il recupero contestuale
 * della normativa vigente sugli atti amministrativi.
 * Permette all'agente AI di rispondere con riferimenti normativi accurati.
 */
@ApplicationScoped
public class NormativaRagService {

    /**
     * Recupera i riferimenti normativi rilevanti per una determinazione.
     *
     * @param query testo della query per la ricerca semantica
     * @return lista di riferimenti normativi pertinenti
     */
    public List<String> cercaNormativa(String query) {
        // Implementazione base con riferimenti statici
        // In produzione: integrazione con vector store (es. pgvector)
        return List.of(
            "D.Lgs. 267/2000 (TUEL) - Art. 107: Funzioni e responsabilità della dirigenza",
            "D.Lgs. 267/2000 (TUEL) - Art. 151: Principi in materia di contabilità",
            "D.Lgs. 267/2000 (TUEL) - Art. 183: Impegno di spesa",
            "L. 241/1990 - Procedimento amministrativo e diritto di accesso",
            "D.Lgs. 33/2013 - Trasparenza e pubblicazione atti"
        );
    }

    /**
     * Verifica se una determinazione richiede pubblicazione obbligatoria
     * all'albo pretorio in base alla normativa.
     *
     * @param importo    importo della determinazione
     * @param tipologia  tipologia dell'atto
     * @return true se la pubblicazione è obbligatoria
     */
    public boolean richiedePubblicazione(Double importo, String tipologia) {
        // Tutte le determinazioni dirigenziali richiedono pubblicazione obbligatoria
        return true;
    }
}
