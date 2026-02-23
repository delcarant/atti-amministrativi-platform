# Workflow Determinazione Dirigenziale

## 1. Cos'è una Determinazione Dirigenziale

La **determinazione dirigenziale** è l'atto amministrativo con cui il dirigente di un ente locale esercita le proprie competenze gestionali, in conformità con l'art. 107 del D.Lgs. 267/2000 (TUEL - Testo Unico degli Enti Locali).

### Base Normativa
- **D.Lgs. 267/2000 (TUEL)**, art. 107: attribuisce ai dirigenti la gestione amministrativa, finanziaria e tecnica
- **D.Lgs. 267/2000 (TUEL)**, art. 183: disciplina l'assunzione di impegni di spesa
- **D.Lgs. 267/2000 (TUEL)**, art. 151: principi generali della contabilità degli enti locali
- **L. 241/1990**: disciplina il procedimento amministrativo e il diritto di accesso
- **D.Lgs. 33/2013**: obblighi di trasparenza e pubblicazione degli atti

### Tipologie di Atti
| Tipo | Soggetto | Oggetto |
|------|---------|---------|
| Determinazione Dirigenziale | Dirigente | Atti di gestione con impegno di spesa |
| Delibera di Giunta | Giunta Comunale | Atti di indirizzo e programmazione |
| Delibera di Consiglio | Consiglio Comunale | Atti fondamentali (statuto, bilancio) |
| Ordinanza | Sindaco | Provvedimenti contingibili e urgenti |

---

## 2. Fasi del Workflow

Il processo è modellato in BPMN2 (`determinazione-dirigenziale.bpmn`) e gestito da Apache Kogito.

```
AVVIO
  │
  ▼
┌─────────────────┐
│  1. ISTRUTTORIA │  ← User Task (ruolo: istruttore)
│                 │
│  L'istruttore   │
│  compila i dati │
│  dell'atto      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  2. VERIFICA        │  ← Business Rule Task (DMN/Drools)
│     COMPETENZA      │
│                     │
│  Il sistema verifica│
│  se il dirigente è  │
│  competente per     │
│  l'importo richiesto│
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  Competente?│
    └──┬──────┬───┘
       │ SÌ   │ NO
       │      ▼
       │  ┌──────────────────┐
       │  │  FINE: RIFIUTATA │
       │  │  (Incompetenza)  │
       │  └──────────────────┘
       │
       ▼
┌──────────────────────┐
│  3. VISTO CONTABILE  │  ← User Task (ruolo: ragioniere)
│                      │
│  Il ragioniere       │
│  appone il visto di  │
│  regolarità contabile│
│  (art. 151 TUEL)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  4. FIRMA DIRIGENTE  │  ← User Task (ruolo: dirigente)
│                      │
│  Il dirigente        │
│  competente firma    │
│  l'atto              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  5. PUBBLICAZIONE    │  ← Script Task (automatico)
│     ALBO PRETORIO    │
│                      │
│  Il sistema pubblica │
│  automaticamente     │
│  l'atto all'albo     │
│  pretorio online     │
└──────────┬───────────┘
           │
           ▼
        FINE: PUBBLICATA
```

---

## 3. Ruoli e Responsabilità

### 3.1 Istruttore (`ruolo: istruttore`)
**Chi è**: Funzionario amministrativo responsabile dell'istruttoria

**Responsabilità**:
- Avvio del procedimento
- Compilazione dei dati dell'atto (oggetto, importo, centro di spesa)
- Verifica della completezza della documentazione
- Completamento del task "Istruttoria Atto"

**Utente di test**: `mario.rossi` / `Password1!`

### 3.2 Ragioniere (`ruolo: ragioniere`)
**Chi è**: Responsabile del servizio finanziario

**Responsabilità**:
- Verifica della disponibilità finanziaria sul capitolo di spesa
- Apposizione del visto di regolarità contabile (art. 151 TUEL)
- Completamento del task "Visto di Regolarità Contabile"

**Utente di test**: `luigi.bianchi` / `Password1!`

### 3.3 Dirigente (`ruolo: dirigente`)
**Chi è**: Dirigente responsabile del settore competente

**Responsabilità**:
- Verifica della legittimità e opportunità dell'atto
- Firma digitale della determinazione
- Completamento del task "Firma Dirigente"
- Aggiornamento degli stati degli atti

**Utente di test**: `anna.verdi` / `Password1!`

### 3.4 Amministratore (`ruolo: admin`)
**Chi è**: Amministratore di sistema

**Responsabilità**:
- Monitoraggio dell'audit log
- Gestione degli utenti su Keycloak
- Configurazione del sistema

**Utente di test**: `admin` / `Password1!`

---

## 4. Regole di Verifica Competenza (DMN)

La verifica della competenza è automatizzata tramite il modello DMN `verifica-competenza.dmn`.

### Tabella di Decisione

| Livello Dirigente | Importo | Competente | Motivazione |
|-------------------|---------|-----------|-------------|
| D1 | ≤ €5.000 | ✅ Sì | "Competenza D1: fino a 5.000 euro" |
| D1 | > €5.000 | ❌ No | "Importo supera limite D1 (5.000 euro)" |
| D2 | ≤ €50.000 | ✅ Sì | "Competenza D2: fino a 50.000 euro" |
| D2 | > €50.000 | ❌ No | "Importo supera limite D2 (50.000 euro)" |
| D3 | Qualsiasi | ✅ Sì | "Competenza D3: nessun limite di importo" |

### Comportamento in Caso di Incompetenza
Se il dirigente non è competente per l'importo richiesto:
1. Il processo segue il flusso "No" dal gateway esclusivo
2. Lo stato dell'atto viene impostato a `RIFIUTATA`
3. Viene registrato un evento di audit con tipo `INCOMPETENZA`
4. L'istruttore viene notificato

---

## 5. Stati della Determinazione

```
BOZZA ──────────────────────────────────────────────────────────────
  │                                                                   │
  ▼                                                                   │
ISTRUTTORIA (task assegnato all'istruttore)                         │
  │                                                                   │
  ▼                                                                   │
VERIFICA_COMPETENZA (automatico via DMN)                            │
  │                                                                   │
  ├──── Incompetente ──────▶  RIFIUTATA ◀──────────────────────────┘
  │
  ▼
VISTO_CONTABILE (task assegnato al ragioniere)
  │
  ▼
FIRMATA (task assegnato al dirigente)
  │
  ▼
PUBBLICATA (automatico - albo pretorio)
```

| Stato | Descrizione | Attore |
|-------|-------------|--------|
| `BOZZA` | Atto appena creato, non ancora avviato | Sistema |
| `ISTRUTTORIA` | In fase di istruttoria | Istruttore |
| `VISTO_CONTABILE` | In attesa del visto ragioniere | Ragioniere |
| `FIRMATA` | Firmata dal dirigente, in attesa pubblicazione | Dirigente |
| `PUBBLICATA` | Pubblicata sull'albo pretorio | Sistema |
| `RIFIUTATA` | Rifiutata per incompetenza dirigenziale | Sistema (DMN) |

---

## 6. Esempi Pratici

### Esempio 1: Acquisto materiale d'ufficio (€1.500 - D1 competente)

```json
{
  "oggetto": "Acquisto materiale di cancelleria per uffici comunali - II semestre 2026",
  "importo": 1500.00,
  "centroSpesa": "UFFICIO-SEGRETERIA",
  "livelloDirigente": "D1"
}
```

**Flusso**: BOZZA → ISTRUTTORIA → ✅ D1 competente → VISTO_CONTABILE → FIRMATA → PUBBLICATA

### Esempio 2: Manutenzione straordinaria (€8.000 - D1 non competente)

```json
{
  "oggetto": "Manutenzione straordinaria edificio scolastico",
  "importo": 8000.00,
  "centroSpesa": "LAVORI-PUBBLICI",
  "livelloDirigente": "D1"
}
```

**Flusso**: BOZZA → ISTRUTTORIA → ❌ D1 non competente (limite €5.000) → RIFIUTATA

**Soluzione**: assegnare il procedimento a un dirigente D2 o D3.

### Esempio 3: Progetto di riqualificazione (€45.000 - D2 competente)

```json
{
  "oggetto": "Affidamento servizio di riqualificazione energetica edifici comunali",
  "importo": 45000.00,
  "centroSpesa": "LAVORI-PUBBLICI",
  "livelloDirigente": "D2"
}
```

**Flusso**: BOZZA → ISTRUTTORIA → ✅ D2 competente → VISTO_CONTABILE → FIRMATA → PUBBLICATA

### Esempio 4: Opera pubblica (€200.000 - D3 sempre competente)

```json
{
  "oggetto": "Approvazione progetto esecutivo nuovo polo scolastico",
  "importo": 200000.00,
  "centroSpesa": "OPERE-PUBBLICHE",
  "livelloDirigente": "D3"
}
```

**Flusso**: BOZZA → ISTRUTTORIA → ✅ D3 sempre competente → VISTO_CONTABILE → FIRMATA → PUBBLICATA

---

## 7. API di Esempio

### Creare una determinazione
```bash
curl -X POST http://localhost:8080/determinazioni \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oggetto": "Acquisto arredi ufficio",
    "importo": 3000.00,
    "centroSpesa": "UFFICIO-PERSONALE",
    "livelloDirigente": "D1"
  }'
```

### Aggiornare lo stato
```bash
curl -X PUT http://localhost:8080/determinazioni/1/stato \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stato": "ISTRUTTORIA"}'
```

### Visualizzare il log di audit
```bash
curl -X GET "http://localhost:8082/audit?processInstanceId=proc-123" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
