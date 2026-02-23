# 🚀 Guida Avvio Completo — Atti Amministrativi Platform

Questa guida descrive come installare, configurare e avviare l'intera piattaforma **Atti Amministrativi** in ambiente locale usando Docker Compose, e come accedere a ciascuna applicazione.

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato sul tuo sistema:

| Tool | Versione minima | Comando di verifica |
|---|---|---|
| **Docker** | 24.x+ | `docker --version` |
| **Docker Compose** | 2.x+ | `docker compose version` |
| **Git** | qualsiasi | `git --version` |
| **Java** *(opzionale, solo sviluppo)* | 21+ | `java -version` |
| **Node.js** *(opzionale, solo sviluppo)* | 20+ | `node --version` |
| **Maven** *(opzionale, solo sviluppo)* | 3.9+ | `mvn --version` |

> ⚠️ **Nota**: Per l'avvio tramite Docker Compose sono necessari solo Docker e Git. Java e Node.js servono solo se vuoi sviluppare o compilare i moduli localmente.

---

## 🏁 Avvio Rapido (tutto con un comando)

### Step 1 — Clona il repository

```bash
# Clona il repository
git clone https://github.com/delcarant/atti-amministrativi-platform.git

# Entra nella directory del progetto
cd atti-amministrativi-platform
```

### Step 2 — Avvia tutti i servizi

```bash
# Entra nella cartella dell'infrastruttura Docker
cd infra/docker

# Avvia tutti i servizi in background (modalità detached)
docker compose up -d

# In alternativa, per vedere i log in tempo reale:
docker compose up
```

### Step 3 — Verifica che i servizi siano avviati

```bash
# Controlla lo stato di tutti i container
docker compose ps

# Output atteso: tutti i servizi in stato "healthy" o "running"
```

> ⏱️ **Tempo stimato di avvio**: 2-4 minuti al primo avvio (le immagini Docker devono essere scaricate). Keycloak impiega più tempo degli altri servizi per inizializzarsi.

### Step 4 — Verifica che Keycloak sia pronto

```bash
# Attendi che Keycloak sia completamente avviato
docker compose logs -f keycloak

# Cerca nel log la riga:
# "Keycloak 25.x.x on JVM (powered by Quarkus) started"
# Premi CTRL+C per uscire dai log
```

---

## 🌐 Accesso alle Applicazioni

Una volta che tutti i container sono in stato `healthy`, puoi accedere ai seguenti servizi:

### 🖥️ 1. Frontend React — Interfaccia Principale

| Campo | Valore |
|---|---|
| **URL** | http://localhost:3000 |
| **Descrizione** | Interfaccia principale per la gestione degli atti amministrativi |

L'applicazione frontend offre:
- **Dashboard**: statistiche sugli atti (totale, in lavorazione, firmati, pubblicati)
- **Lista Determinazioni**: elenco completo con filtri per stato e paginazione
- **Task Inbox**: lista dei task Kogito assegnati all'utente corrente
- **Link all'editor**: accesso diretto al KIE Sandbox per disegnare BPMN e DMN

Al primo accesso verrai automaticamente reindirizzato alla pagina di login di **Keycloak**.

---

### ✏️ 2. KIE Sandbox — Editor BPMN/DMN (Self-Hosted)

| Campo | Valore |
|---|---|
| **URL** | http://localhost:9090 |
| **Descrizione** | Editor visuale per processi BPMN e regole DMN (equivalente a sandbox.kie.org) |

Il KIE Sandbox permette di:
- Disegnare e modificare processi **BPMN 2.0** in modo visuale
- Creare e modificare tabelle decisionali **DMN 1.3**
- Testare i modelli direttamente nel browser
- Esportare e importare file `.bpmn` e `.dmn`

> 🔐 L'accesso è protetto da autenticazione Keycloak.

---

### ⚙️ 3. Process Engine API — Swagger UI

| Campo | Valore |
|---|---|
| **URL** | http://localhost:8080/q/swagger-ui |
| **Metriche** | http://localhost:8080/q/metrics |
| **Health check** | http://localhost:8080/q/health |
| **Descrizione** | Documentazione interattiva delle API REST Quarkus/Kogito |

Lo Swagger UI permette di:
- Consultare tutti gli endpoint REST disponibili
- Testare le API direttamente dal browser (con autenticazione Bearer token)
- Visualizzare i modelli di richiesta e risposta

Per ottenere un token Bearer da Keycloak:
```bash
curl -s -X POST http://localhost:8180/realms/atti-amministrativi/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=frontend" \
  -d "username=mario.rossi" \
  -d "password=Password1!" \
  -d "grant_type=password" | jq -r '.access_token'
```

---

### 🔐 4. Keycloak — Identity & Access Management

| Campo | Valore |
|---|---|
| **URL** | http://localhost:8180 |
| **Admin Console** | http://localhost:8180/admin |
| **Realm** | `atti-amministrativi` |
| **Username admin** | `admin` |
| **Password admin** | `admin` |

Dalla Admin Console puoi:
- Gestire utenti, ruoli e gruppi
- Configurare i client (frontend, process-engine, kie-sandbox)
- Monitorare le sessioni attive
- Configurare policy di accesso

---

### 📊 5. Grafana — Dashboard di Monitoraggio

| Campo | Valore |
|---|---|
| **URL** | http://localhost:3001 |
| **Username** | `admin` |
| **Password** | `admin` |

Le dashboard preconfigurate mostrano:
- Numero di istanze di processo attive
- Tempo medio di completamento delle determinazioni
- Task in attesa per ruolo
- Metriche JVM del process engine (heap, GC, thread)
- Richieste HTTP per endpoint e codice di risposta

---

### 📈 6. Prometheus — Metriche Raw

| Campo | Valore |
|---|---|
| **URL** | http://localhost:9091 |
| **Descrizione** | Raccolta e visualizzazione metriche Quarkus/Micrometer |

---

## 👤 Utenti di Test Preconfigurati

Il realm Keycloak `atti-amministrativi` include i seguenti utenti di test, tutti con password **`Password1!`**:

| Utente | Password | Ruolo | Permessi |
|---|---|---|---|
| `mario.rossi` | `Password1!` | `istruttore` | Avviare nuove determinazioni, compilare l'istruttoria |
| `luigi.bianchi` | `Password1!` | `ragioniere` | Apporre il visto di regolarità contabile |
| `anna.verdi` | `Password1!` | `dirigente` | Firmare le determinazioni dirigenziali |
| `admin` | `Password1!` | `admin` | Accesso completo, console Keycloak, audit log |

---

## 📝 Come Testare un Workflow Completo

Segui questi passi per simulare l'intero ciclo di vita di una **Determinazione Dirigenziale**:

### Fase 1️⃣ — Avvio Istruttoria (come Istruttore)

1. Vai su **http://localhost:3000**
2. Accedi con `mario.rossi` / `Password1!`
3. Clicca su **"Atti"** nel menu laterale sinistro
4. Clicca il pulsante **"Nuova Determinazione"**
5. Compila il form con i seguenti dati di esempio:

| Campo | Valore di esempio |
|---|---|
| **Oggetto** | `Acquisto materiale di cancelleria per uffici comunali` |
| **Importo** | `3500` |
| **Centro di Spesa** | `Ufficio Amministrativo` |
| **Dirigente** | `Anna Verdi` |
| **Livello Dirigente** | `D1` |

6. Clicca **"Avvia Procedimento"**
7. Il processo Kogito si avvia e il motore DMN verifica automaticamente la competenza:
   - Dirigente D1 con importo €3.500 → ✅ **Competente** (limite D1: €5.000)
8. Il task "Istruttoria Atto" appare nel tuo **Task Inbox**
9. Vai su **"Task Inbox"**, clicca **"Completa Istruttoria"**, inserisci le note e conferma

---

### Fase 2️⃣ — Visto di Regolarità Contabile (come Ragioniere)

1. **Esci** dall'account `mario.rossi` (menu in alto a destra → Logout)
2. Accedi con `luigi.bianchi` / `Password1!`
3. Vai su **"Task Inbox"**
4. Troverai il task **"Visto di Regolarità Contabile"** per la determinazione appena creata
5. Clicca **"Apri Task"**, verifica i dati contabili
6. Clicca **"Apponi Visto"** → il task viene completato ✅

---

### Fase 3️⃣ — Firma del Dirigente

1. **Esci** dall'account `luigi.bianchi`
2. Accedi con `anna.verdi` / `Password1!`
3. Vai su **"Task Inbox"**
4. Troverai il task **"Firma Dirigente"**
5. Clicca **"Apri Task"**, esamina il documento
6. Clicca **"Firma"** → la determinazione viene firmata digitalmente ✅
7. Il sistema esegue automaticamente la pubblicazione sull'**Albo Pretorio** (registrata nel log)

---

### Fase 4️⃣ — Verifica del Risultato

1. Torna su **"Atti"** (con qualsiasi utente)
2. La determinazione mostra stato **`PUBBLICATA`** 🎉
3. Come `admin`, vai su **http://localhost:8080/audit** per vedere il trail di audit completo

---

### Test con Importo Fuori Competenza (scenario di rifiuto)

Per testare il rifiuto automatico per incompetenza:

| Campo | Valore |
|---|---|
| **Importo** | `8000` |
| **Livello Dirigente** | `D1` |

Il motore DMN rileverà che €8.000 supera il limite D1 (€5.000) e il processo verrà automaticamente terminato con stato **`RIFIUTATA`** per incompetenza, senza passare per i task successivi.

---

## 🔧 Comandi Docker Compose Utili

```bash
# Vedere lo stato di tutti i container
docker compose ps

# Vedere i log di tutti i servizi in tempo reale
docker compose logs -f

# Vedere i log di un servizio specifico
docker compose logs -f keycloak
docker compose logs -f process-engine
docker compose logs -f frontend
docker compose logs -f kie-sandbox

# Riavviare un singolo servizio
docker compose restart process-engine

# Fermare tutti i servizi (i dati vengono preservati)
docker compose down

# Fermare e rimuovere anche i volumi (RESET COMPLETO — i dati vengono persi)
docker compose down -v

# Ricostruire le immagini Docker (dopo modifiche al codice)
docker compose build
docker compose up -d --build

# Scalare un servizio (es. 2 istanze del process-engine)
docker compose up -d --scale process-engine=2
```

---

## 🛠️ Sviluppo Locale (senza Docker)

Se vuoi sviluppare e avviare i moduli singolarmente in modalità dev:

### Backend — Quarkus Dev Mode

```bash
# Avvia solo i servizi di infrastruttura (DB, Keycloak, Kafka)
cd infra/docker
docker compose up -d postgres keycloak kafka zookeeper

# In un altro terminale, avvia il process-engine in dev mode
cd process-engine
mvn quarkus:dev

# Quarkus Dev UI disponibile su:
# http://localhost:8080/q/dev-ui
```

### Frontend — React Dev Server

```bash
cd frontend
npm install
npm start

# Frontend disponibile su: http://localhost:3000
# Hot reload attivo — le modifiche si riflettono immediatamente
```

### Build completo Maven

```bash
# Dalla root del progetto
mvn clean package -DskipTests

# Con i test
mvn clean verify
```

---

## ❗ Risoluzione Problemi Comuni

### Il process-engine non si avvia

**Sintomo**: Il container `process-engine` va in stato `Exit` o `Restarting`

**Causa**: Keycloak o PostgreSQL non sono ancora pronti

**Soluzione**:
```bash
# Attendi 2-3 minuti, poi riavvia il process-engine
docker compose restart process-engine

# Verifica i log per dettagli
docker compose logs process-engine
```

---

### Il login Keycloak fallisce

**Sintomo**: Errore "Invalid credentials" o "Realm not found"

**Causa**: Il realm `atti-amministrativi` non è stato importato correttamente

**Soluzione**:
```bash
# Verifica i log di Keycloak
docker compose logs keycloak | grep -i "import\|realm\|error"

# Se necessario, ricrea il container Keycloak
docker compose rm -f keycloak
docker compose up -d keycloak
```

---

### Il KIE Sandbox non carica

**Sintomo**: Pagina bianca o errore 502

**Causa**: Il container `kie-sandbox` non è avviato o sta ancora inizializzando

**Soluzione**:
```bash
docker compose restart kie-sandbox
docker compose logs -f kie-sandbox
```

---

### Porta già in uso

**Sintomo**: Errore `bind: address already in use`

**Causa**: Un servizio locale usa già quella porta

**Soluzione**: Modifica la mappatura delle porte in `infra/docker/docker-compose.yml`:
```yaml
# Esempio: cambia la porta del frontend da 3000 a 3100
ports:
  - "3100:80"  # host:container
```

---

### Il database non si connette

**Sintomo**: Errore `Connection refused` su PostgreSQL

**Soluzione**:
```bash
# Verifica che PostgreSQL sia healthy
docker compose ps postgres

# Verifica i log
docker compose logs postgres

# Connettiti direttamente al DB per verifica
docker compose exec postgres psql -U kogito -d atti_amministrativi
```

---

## 📚 Link Utili

| Risorsa | URL |
|---|---|
| 📖 Documentazione Architettura | [docs/architettura.md](./architettura.md) |
| 📋 Workflow Determinazione Dirigenziale | [docs/workflow-determinazione.md](./workflow-determinazione.md) |
| 🐙 Repository GitHub | https://github.com/delcarant/atti-amministrativi-platform |
| 📘 Documentazione Quarkus | https://quarkus.io/guides/ |
| 🔄 Documentazione Kogito | https://docs.kogito.kie.org/ |
| 🔐 Documentazione Keycloak | https://www.keycloak.org/documentation |
| ✏️ KIE Sandbox (online) | https://sandbox.kie.org |
| 🐳 Docker Compose Reference | https://docs.docker.com/compose/ |
