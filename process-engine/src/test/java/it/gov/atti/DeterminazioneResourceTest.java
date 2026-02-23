package it.gov.atti;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

/**
 * Test di integrazione per DeterminazioneResource.
 * Verifica che gli endpoint REST siano raggiungibili e rispondano correttamente.
 */
@QuarkusTest
public class DeterminazioneResourceTest {

    /**
     * Verifica che l'endpoint GET /determinazioni richieda autenticazione (401).
     */
    @Test
    public void testListaDeterminazioniRichiedeAutenticazione() {
        given()
            .when().get("/determinazioni")
            .then()
            .statusCode(401);
    }
}
