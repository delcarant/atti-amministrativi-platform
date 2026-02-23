package it.gov.atti.resources;

import it.gov.atti.model.Determinazione;
import it.gov.atti.services.DeterminazioneService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

/**
 * REST resource per la gestione delle determinazioni dirigenziali.
 * Tutte le operazioni richiedono autenticazione OIDC tramite Keycloak.
 */
@Path("/determinazioni")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Determinazioni", description = "API per la gestione delle determinazioni dirigenziali")
public class DeterminazioneResource {

    @Inject
    DeterminazioneService service;

    /** Token JWT dell'utente autenticato */
    @Inject
    JsonWebToken jwt;

    /**
     * Crea una nuova determinazione e avvia il processo Kogito.
     * Richiede ruolo istruttore o dirigente.
     */
    @POST
    @RolesAllowed({"istruttore", "dirigente"})
    @Operation(summary = "Crea una nuova determinazione dirigenziale")
    public Response crea(Determinazione determinazione) {
        String utente = jwt.getName();
        determinazione.dirigente = utente;
        Determinazione creata = service.crea(determinazione);
        return Response.status(Response.Status.CREATED).entity(creata).build();
    }

    /**
     * Restituisce la lista di tutte le determinazioni.
     * Richiede autenticazione.
     */
    @GET
    @Operation(summary = "Recupera la lista di tutte le determinazioni")
    public List<Determinazione> lista() {
        return service.trovaTutte();
    }

    /**
     * Restituisce il dettaglio di una determinazione per ID.
     * Richiede autenticazione.
     *
     * @param id identificativo della determinazione
     */
    @GET
    @Path("/{id}")
    @Operation(summary = "Recupera il dettaglio di una determinazione")
    public Response dettaglio(@PathParam("id") Long id) {
        Determinazione det = service.trovaPerId(id);
        if (det == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(det).build();
    }

    /**
     * Aggiorna lo stato di una determinazione.
     * Richiede ruolo dirigente.
     *
     * @param id      identificativo della determinazione
     * @param payload mappa contenente il campo "stato"
     */
    @PUT
    @Path("/{id}/stato")
    @RolesAllowed("dirigente")
    @Operation(summary = "Aggiorna lo stato di una determinazione")
    public Response aggiornaStato(@PathParam("id") Long id, Map<String, String> payload) {
        String nuovoStato = payload.get("stato");
        if (nuovoStato == null || nuovoStato.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("errore", "Campo 'stato' obbligatorio"))
                    .build();
        }
        Determinazione aggiornata = service.aggiornaStato(id, nuovoStato);
        return Response.ok(aggiornata).build();
    }
}
