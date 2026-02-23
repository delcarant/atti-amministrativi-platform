package it.gov.atti.resources;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

/**
 * REST resource per le funzionalità di amministrazione.
 * Tutti gli endpoint richiedono il ruolo 'admin' tramite autenticazione OIDC Keycloak.
 * Espone operazioni di gestione utenti (proxy verso Keycloak Admin API)
 * e lista delle decision table DMN disponibili nel motore Kogito.
 */
@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("admin")
@Tag(name = "Admin", description = "API di amministrazione — riservate al ruolo admin")
public class AdminResource {

    /**
     * Recupera la lista di tutti gli utenti dal realm Keycloak.
     * Proxy verso la Keycloak Admin API.
     *
     * @return lista di utenti con ruoli e stato
     */
    @GET
    @Path("/utenti")
    @Operation(summary = "Recupera la lista di tutti gli utenti Keycloak")
    public Response listaUtenti() {
        // In produzione: chiamata HTTP verso http://keycloak:8180/admin/realms/atti-amministrativi/users
        // usando un service account con permessi admin
        return Response.ok(List.of()).build();
    }

    /**
     * Crea un nuovo utente nel realm Keycloak.
     *
     * @param payload dati del nuovo utente (username, nome, cognome, email, ruoli)
     * @return il nuovo utente creato con l'ID assegnato da Keycloak
     */
    @POST
    @Path("/utenti")
    @Operation(summary = "Crea un nuovo utente nel realm Keycloak")
    public Response creaUtente(Map<String, Object> payload) {
        if (payload == null || !payload.containsKey("username")) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("errore", "Campo 'username' obbligatorio"))
                    .build();
        }
        // In produzione: POST verso Keycloak Admin API per creare l'utente
        return Response.status(Response.Status.CREATED)
                .entity(Map.of("id", "nuovo-id-generato", "username", payload.get("username")))
                .build();
    }

    /**
     * Aggiorna i dati di un utente esistente.
     *
     * @param id      identificativo Keycloak dell'utente
     * @param payload campi da aggiornare (es. abilitato, nome, cognome, email)
     * @return risposta senza contenuto se l'aggiornamento va a buon fine
     */
    @PUT
    @Path("/utenti/{id}")
    @Operation(summary = "Aggiorna i dati di un utente Keycloak")
    public Response aggiornaUtente(@PathParam("id") String id, Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("errore", "Nessun campo da aggiornare"))
                    .build();
        }
        // In produzione: PUT verso Keycloak Admin API per aggiornare l'utente
        return Response.noContent().build();
    }

    /**
     * Aggiorna i ruoli di un utente nel realm Keycloak.
     *
     * @param id      identificativo Keycloak dell'utente
     * @param payload mappa con chiave "ruoli" contenente la lista dei ruoli da assegnare
     * @return risposta senza contenuto se l'aggiornamento va a buon fine
     */
    @PUT
    @Path("/utenti/{id}/ruoli")
    @Operation(summary = "Aggiorna i ruoli di un utente Keycloak")
    public Response aggiornaRuoli(@PathParam("id") String id, Map<String, Object> payload) {
        Object ruoli = payload != null ? payload.get("ruoli") : null;
        if (ruoli == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("errore", "Campo 'ruoli' obbligatorio"))
                    .build();
        }
        // In produzione: operazioni su Keycloak Admin API per gestire i role mappings
        return Response.noContent().build();
    }

    /**
     * Invia una email di reset password all'utente tramite Keycloak.
     *
     * @param id identificativo Keycloak dell'utente
     * @return risposta senza contenuto se l'invio va a buon fine
     */
    @POST
    @Path("/utenti/{id}/reset-password")
    @Operation(summary = "Invia email di reset password tramite Keycloak")
    public Response resetPassword(@PathParam("id") String id) {
        // In produzione: PUT verso Keycloak Admin API con action "UPDATE_PASSWORD"
        return Response.noContent().build();
    }
}
