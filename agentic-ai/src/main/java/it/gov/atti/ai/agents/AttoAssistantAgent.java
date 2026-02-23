package it.gov.atti.ai.agents;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

/**
 * Agente AI per il supporto alla redazione di atti amministrativi.
 * Utilizza LangChain4j con un modello LLM configurabile.
 */
@RegisterAiService
public interface AttoAssistantAgent {

    /**
     * Suggerisce un oggetto formale per una determinazione dirigenziale
     * partendo da una descrizione informale dell'utente.
     *
     * @param descrizione descrizione informale dell'atto
     * @return oggetto formale suggerito in linguaggio amministrativo
     */
    @SystemMessage("""
            Sei un esperto di diritto amministrativo italiano specializzato nella redazione di atti
            amministrativi per enti locali. Il tuo compito è aiutare i funzionari a redigere
            determinazioni dirigenziali in conformità con il D.Lgs. 267/2000 (TUEL) e le norme vigenti.
            Rispondi sempre in italiano formale e utilizza la terminologia giuridico-amministrativa corretta.
            """)
    @UserMessage("""
            Suggerisci un oggetto formale per una determinazione dirigenziale
            basandoti sulla seguente descrizione: {{descrizione}}
            L'oggetto deve essere conciso, formale e conforme allo stile degli atti amministrativi italiani.
            """)
    String suggerisciOggetto(String descrizione);

    /**
     * Classifica il tipo di atto amministrativo in base al suo contenuto.
     *
     * @param testo testo dell'atto da classificare
     * @return classificazione del tipo di atto
     */
    @SystemMessage("""
            Sei un esperto di diritto amministrativo italiano specializzato nella classificazione
            di atti amministrativi per enti locali. Devi classificare gli atti in base al loro
            contenuto e alla normativa di riferimento (D.Lgs. 267/2000 TUEL, L. 241/1990).
            Rispondi sempre in italiano.
            """)
    @UserMessage("""
            Classifica il seguente atto amministrativo indicando:
            1. Tipo di atto (es. Determinazione Dirigenziale, Delibera di Giunta, Delibera di Consiglio)
            2. Materia (es. Lavori Pubblici, Personale, Finanze, Servizi Sociali)
            3. Livello di urgenza (Ordinario, Urgente, Indifferibile)

            Testo dell'atto: {{testo}}
            """)
    String classificaAtto(String testo);
}
