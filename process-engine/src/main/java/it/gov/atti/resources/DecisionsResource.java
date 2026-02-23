package it.gov.atti.resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

/**
 * REST resource per la visualizzazione delle decision table DMN disponibili nel motore Kogito.
 * Restituisce la lista delle regole DMN caricate, inclusa la tabella di verifica-competenza.
 */
@Path("/decisions")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Decisions", description = "API per la visualizzazione delle regole DMN")
public class DecisionsResource {

    /**
     * Restituisce la lista delle decision table DMN disponibili nel motore Kogito.
     * Include nome, versione, numero di regole e data di ultima modifica.
     *
     * @return lista delle decision table DMN disponibili
     */
    @GET
    @Operation(summary = "Recupera la lista delle regole DMN disponibili nel motore Kogito")
    public Response listaDMN() {
        // Elenco delle regole DMN caricate nel motore Kogito
        List<Map<String, Object>> decisioni = List.of(
            Map.of(
                "id", "verifica-competenza",
                "nome", "verifica-competenza.dmn",
                "versione", "1.0",
                "numeroRegole", 3,
                "ultimaModifica", "2026-01-01T00:00:00",
                "descrizione", "Verifica la competenza del dirigente in base al livello e all'importo",
                "inputs", List.of("Livello Dirigente", "Importo"),
                "outputs", List.of("Competente", "Motivazione"),
                "regole", List.of(
                    Map.of("Livello Dirigente", "D1", "Importo", "<= 5000", "Competente", "true", "Motivazione", "D1 competente fino a \u20ac5.000"),
                    Map.of("Livello Dirigente", "D2", "Importo", "<= 25000", "Competente", "true", "Motivazione", "D2 competente fino a \u20ac25.000"),
                    Map.of("Livello Dirigente", "D3", "Importo", "<= 100000", "Competente", "true", "Motivazione", "D3 competente fino a \u20ac100.000")
                )
            )
        );
        return Response.ok(decisioni).build();
    }
}
