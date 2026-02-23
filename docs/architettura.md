# Architettura del Sistema - Atti Amministrativi Platform

## 1. Introduzione e Obiettivi

La piattaforma **Atti Amministrativi** è un sistema open source progettato per digitalizzare e automatizzare la gestione degli atti amministrativi degli enti locali italiani, in conformità con il D.Lgs. 267/2000 (TUEL) e le normative vigenti in materia di trasparenza e digitalizzazione della Pubblica Amministrazione (D.Lgs. 33/2013, CAD).

### Obiettivi Principali

- **Automazione dei processi amministrativi**: riduzione del lavoro manuale attraverso workflow BPMN2 gestiti da Apache Kogito
- **Conformità normativa**: applicazione automatica delle regole di competenza dirigenziale tramite DMN/Drools
- **Trasparenza e audit**: tracciabilità completa di tutte le operazioni sugli atti
- **Sicurezza**: autenticazione e autorizzazione centralizzata tramite Keycloak OIDC
- **Scalabilità**: architettura a microservizi deployabile su Kubernetes
- **AI-Assisted**: supporto alla redazione degli atti tramite agenti AI (LangChain4j)

---

## 2. Principi Architetturali

### Domain-Driven Design (DDD)
Il sistema è organizzato attorno al dominio degli **atti amministrativi**. Ogni bounded context corrisponde a un modulo Maven separato:
- `process-engine`: gestione del ciclo di vita degli atti
- `decision-engine`: regole di business (competenza dirigenziale)
- `governance`: audit e tracciabilità
- `agentic-ai`: supporto AI alla redazione

### API-First
Tutti i servizi espongono API REST documentate con OpenAPI/Swagger. La specifica API è definita prima dell'implementazione e viene generata automaticamente da Quarkus con SmallRye OpenAPI.

### AI-Native
L'intelligenza artificiale è integrata nativamente nel processo, non aggiunta come strato esterno. Gli agenti AI (AttoAssistantAgent) supportano i funzionari nella redazione degli atti, suggerendo oggetti formali e classificando il tipo di atto.

### Security-by-Default
Ogni endpoint richiede autenticazione JWT tramite Keycloak. L'autorizzazione è basata su ruoli (RBAC) con granularità fine per ogni operazione. I segreti sono gestiti tramite variabili d'ambiente e Kubernetes Secrets.

### Event-Driven
I moduli comunicano tramite Apache Kafka per operazioni asincrone (notifiche, audit log, sincronizzazione stati).

---

## 3. Diagramma Architetturale

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER PRESENTAZIONE                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │          Frontend React 18 + TypeScript + PatternFly 5      │   │
│  │              http://localhost:3000                          │   │
│  └────────────────────────────┬────────────────────────────────┘   │
│                               │ HTTPS / REST / OIDC                │
│  ┌────────────────────────────▼────────────────────────────────┐   │
│  │                    Nginx API Gateway                         │   │
│  │              Reverse proxy + Static files                    │   │
│  └──────┬──────────────────┬─────────────────┬─────────────────┘   │
└─────────┼──────────────────┼─────────────────┼───────────────────┘
          │                  │                 │
          │ REST             │ REST            │ REST
┌─────────▼──────┐  ┌────────▼──────┐  ┌──────▼────────┐
│  Process       │  │  Governance   │  │  Agentic AI   │
│  Engine        │  │  (Audit Log)  │  │  (LangChain4j)│
│                │  │               │  │               │
│  Quarkus 3.8   │  │  Quarkus 3.8  │  │  Quarkus 3.8  │
│  + Kogito      │  │  :8082        │  │  :8083        │
│  :8080         │  │               │  │               │
│                │  │  AuditEvent   │  │  AttoAssist   │
│  Determinaz.   │  │  AuditLog     │  │  Agent        │
│  BPMN Workflow │  │  Resource     │  │  RAG Service  │
│  DMN Rules     │  │               │  │               │
└───────┬────────┘  └───────┬───────┘  └───────────────┘
        │                   │
        │ JDBC              │ JDBC
        │                   │
┌───────▼───────────────────▼────────────────────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐  │
│  │   PostgreSQL 16      │    │         Apache Kafka             │  │
│  │                      │    │                                  │  │
│  │   - determinazioni   │    │   - kogito-process-instances     │  │
│  │   - audit_log        │    │   - atti-eventi                  │  │
│  │   - kogito_*         │    │   - audit-eventi                 │  │
│  │                      │    │                                  │  │
│  └──────────────────────┘    └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER SICUREZZA / IAM                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Keycloak 25.0                              │  │
│  │              http://localhost:8180                           │  │
│  │                                                              │  │
│  │  Realm: atti-amministrativi                                  │  │
│  │  Clients: process-engine, frontend, kie-sandbox              │  │
│  │  Ruoli: istruttore, ragioniere, dirigente, admin             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER MONITORING                                  │
│                                                                     │
│  ┌────────────────┐    ┌────────────────┐    ┌──────────────────┐  │
│  │  Prometheus    │    │    Grafana      │    │  OpenTelemetry   │  │
│  │  :9091         │───▶│    :3001        │    │  Collector       │  │
│  │                │    │                │    │  :4317           │  │
│  └────────────────┘    └────────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Descrizione dei Componenti

### 4.1 Process Engine (`:8080`)
Il cuore della piattaforma. Gestisce l'intero ciclo di vita delle determinazioni dirigenziali.

**Tecnologie**: Quarkus 3.8 + Apache Kogito + PostgreSQL

**Funzionalità**:
- Avvio e gestione di istanze di processo BPMN2 (`determinazione-dirigenziale.bpmn`)
- Gestione task umani (User Tasks) per istruttori, ragionieri e dirigenti
- Integrazione con il Decision Engine per la verifica automatica della competenza
- API REST per creazione, lettura e aggiornamento delle determinazioni
- Pubblicazione automatica all'albo pretorio al completamento del workflow

**Endpoint principali**:
| Metodo | Path | Descrizione |
|--------|------|-------------|
| POST | `/determinazioni` | Crea nuova determinazione |
| GET | `/determinazioni` | Lista tutte le determinazioni |
| GET | `/determinazioni/{id}` | Dettaglio determinazione |
| PUT | `/determinazioni/{id}/stato` | Aggiorna stato |
| GET | `/q/swagger-ui` | Documentazione API |
| GET | `/q/health` | Health check |
| GET | `/q/metrics` | Metriche Prometheus |

### 4.2 Decision Engine (DMN/Drools)
Motore di regole per la verifica automatica della competenza dirigenziale.

**Tecnologie**: Apache Drools + DMN (Decision Model and Notation)

**Regole implementate** (`verifica-competenza.dmn`):
| Livello | Limite Importo | Competente |
|---------|---------------|-----------|
| D1 | ≤ €5.000 | Sì |
| D1 | > €5.000 | No |
| D2 | ≤ €50.000 | Sì |
| D2 | > €50.000 | No |
| D3 | Qualsiasi | Sì |

### 4.3 Governance (`:8082`)
Modulo per la tracciabilità e l'audit di tutte le operazioni.

**Tecnologie**: Quarkus 3.8 + PostgreSQL

**Funzionalità**:
- Registrazione automatica di tutti gli eventi significativi
- Query filtrate per processo, utente, periodo temporale
- Accesso limitato al ruolo `admin`

### 4.4 Agentic AI (`:8083`)
Modulo di intelligenza artificiale per il supporto alla redazione degli atti.

**Tecnologie**: Quarkus 3.8 + LangChain4j + OpenAI API (configurabile)

**Agenti disponibili**:
- `AttoAssistantAgent.suggerisciOggetto()`: suggerisce un oggetto formale partendo da una descrizione informale
- `AttoAssistantAgent.classificaAtto()`: classifica il tipo di atto, la materia e l'urgenza
- `NormativaRagService`: recupera riferimenti normativi contestuali (RAG)

### 4.5 Frontend React (`:3000`)
Interfaccia utente web per tutti gli utenti della piattaforma.

**Tecnologie**: React 18 + TypeScript + PatternFly 5 + Keycloak JS

**Pagine principali**:
- **Dashboard**: statistiche aggregate sulle determinazioni
- **Atti List**: lista, filtro e creazione di determinazioni
- **Task Inbox**: gestione dei task Kogito assegnati all'utente

### 4.6 KIE Sandbox (`:9090`)
Editor visuale self-hosted per la modifica di modelli BPMN2 e DMN.

**Tecnologie**: Apache KIE Sandbox (webapp)

**Funzionalità**:
- Editor drag-and-drop per workflow BPMN2
- Editor tabellare per regole DMN
- Simulazione e test delle decisioni
- Esportazione diretta nel repository

---

## 5. Sicurezza

### 5.1 Keycloak e OIDC
Tutti i servizi backend utilizzano Quarkus OIDC per autenticare le richieste. Il flusso di autenticazione è:

1. L'utente si autentica sul frontend tramite Keycloak (Authorization Code Flow)
2. Il frontend riceve un JWT (Access Token)
3. Ogni richiesta API include `Authorization: Bearer <token>`
4. Il backend valida il token tramite la chiave pubblica di Keycloak

### 5.2 Ruoli e Autorizzazioni

| Ruolo | Permessi |
|-------|---------|
| `istruttore` | Creazione determinazioni, completamento task istruttoria |
| `ragioniere` | Completamento task visto contabile |
| `dirigente` | Firma atti, aggiornamento stati, accesso completo |
| `admin` | Accesso al log di audit, gestione utenti |

### 5.3 Protezione API
- Tutti gli endpoint sono protetti da autenticazione (policy `authenticated`)
- Le operazioni sensibili richiedono ruoli specifici (`@RolesAllowed`)
- CORS configurato per consentire solo origini autorizzate
- Header di sicurezza HTTP (X-Frame-Options, X-Content-Type-Options, etc.)

---

## 6. Monitoring e Observability

### 6.1 Metriche (Prometheus + Grafana)
- Ogni servizio Quarkus espone metriche su `/q/metrics` (Micrometer + Prometheus)
- Prometheus raccoglie le metriche ogni 15 secondi
- Grafana visualizza le dashboard (disponibile su `:3001`)

### 6.2 Tracing Distribuito (OpenTelemetry)
- Ogni richiesta HTTP genera uno span distribuito
- I trace sono raccolti dall'OpenTelemetry Collector (`:4317`)
- Correlazione automatica tra i microservizi

### 6.3 Health Checks
- Quarkus espone `/q/health/live` e `/q/health/ready`
- Docker Compose e Kubernetes usano questi endpoint per i liveness/readiness probe

---

## 7. Deployment

### 7.1 Sviluppo Locale (Docker Compose)
```bash
cd infra/docker
docker compose up -d
```
Avvia tutti i servizi in ordine corretto grazie alle dipendenze e healthcheck.

### 7.2 Kubernetes (Helm)
```bash
helm upgrade --install atti-amministrativi ./infra/kubernetes/helm \
  --namespace atti-prod \
  --create-namespace \
  --set processEngine.image.tag=1.0.0
```

### 7.3 CI/CD (GitHub Actions)
- **CI** (`.github/workflows/ci.yml`): build e test su ogni push/PR
- **Deploy** (`.github/workflows/deploy.yml`): deploy manuale su staging/production

### 7.4 Considerazioni di Scalabilità
- Il Process Engine supporta scaling orizzontale (stateless, stato su PostgreSQL)
- Kafka garantisce la comunicazione asincrona tra repliche
- PostgreSQL può essere sostituito con un cluster HA (es. Patroni)
