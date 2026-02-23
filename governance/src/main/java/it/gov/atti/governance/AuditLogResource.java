package it.gov.atti.governance;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST resource per la gestione del log di audit.
 * Tutte le operazioni richiedono ruolo admin per la lettura.
 */
@Path("/audit")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Audit Log", description = "API per la gestione del log di audit")
public class AuditLogResource {

    /** Token JWT dell'utente autenticato */
    @Inject
    JsonWebToken jwt;

    /**
     * Recupera la lista degli eventi di audit con filtri opzionali.
     * Accessibile solo agli utenti con ruolo admin.
     *
     * @param processInstanceId filtro per ID istanza processo (opzionale)
     * @param userId            filtro per ID utente (opzionale)
     * @param from              filtro data inizio (opzionale, formato ISO)
     * @param to                filtro data fine (opzionale, formato ISO)
     * @return lista degli eventi di audit filtrati
     */
    @GET
    @RolesAllowed("admin")
    @Operation(summary = "Recupera la lista degli eventi di audit")
    public List<AuditEvent> lista(
            @QueryParam("processInstanceId") String processInstanceId,
            @QueryParam("userId") String userId,
            @QueryParam("from") String from,
            @QueryParam("to") String to) {

        if (processInstanceId != null && !processInstanceId.isBlank()) {
            return AuditEvent.list("processInstanceId", processInstanceId);
        }
        if (userId != null && !userId.isBlank()) {
            return AuditEvent.list("userId", userId);
        }
        return AuditEvent.listAll();
    }

    /**
     * Registra un nuovo evento di audit.
     * Chiamato internamente dagli altri moduli della piattaforma.
     *
     * @param evento dati dell'evento da registrare
     * @return l'evento registrato con ID assegnato
     */
    @POST
    @Transactional
    @Operation(summary = "Registra un nuovo evento di audit")
    public Response registra(AuditEvent evento) {
        evento.timestamp = LocalDateTime.now();
        if (evento.userId == null || evento.userId.isBlank()) {
            evento.userId = jwt.getName();
        }
        evento.persist();
        return Response.status(Response.Status.CREATED).entity(evento).build();
    }
}
