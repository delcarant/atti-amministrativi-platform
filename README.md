# 🏛️ Atti Amministrativi Platform

[![CI](https://github.com/delcarant/atti-amministrativi-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/delcarant/atti-amministrativi-platform/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Quarkus 3.8](https://img.shields.io/badge/Quarkus-3.8.x-blueviolet.svg)](https://quarkus.io/)

Piattaforma open source per la gestione di **atti amministrativi** (determinazioni dirigenziali, delibere, etc.) ispirata all'architettura di sistemi enterprise, basata su stack 100% open source.

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                   │
│                  PatternFly 5 + Keycloak                 │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│                   Nginx API Gateway                      │
└──────┬─────────────────┬──────────────────┬─────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  Process    │  │  Governance  │  │  Agentic AI  │
│  Engine     │  │  (Audit Log) │  │  (LangChain4j)│
│  (Quarkus+  │  │  (Quarkus)   │  │  (Quarkus)   │
│   Kogito)   │  └───────┬──────┘  └──────────────┘
└──────┬──────┘          │
       │                 │
┌──────▼─────────────────▼────────────────────────────────┐
│                  PostgreSQL 16 + Kafka                   │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Runtime / Backend | **Quarkus 3.8.x LTS** + **Kogito** |
| Process Engine | **Apache Kogito** (BPMN2) |
| Decision Engine | **Drools / DMN** |
| Security / IAM | **Keycloak 25+** (OIDC/JWT) |
| Visual Editor | **KIE Sandbox self-hosted** |
| Database | **PostgreSQL 16** |
| Messaggistica | **Apache Kafka** |
| Containerization | **Docker + Docker Compose** |
| Orchestrazione | **Kubernetes (Helm Charts)** |
| CI/CD | **GitHub Actions** |
| Monitoring | **Prometheus + Grafana + OpenTelemetry** |
| Frontend | **React 18 + TypeScript + PatternFly 5** |
| Java Version | **Java 21** |

## 📋 Prerequisiti

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) v2+
- [Java 21](https://adoptium.net/) (per sviluppo locale)
- [Node.js 20](https://nodejs.org/) (per sviluppo frontend locale)
- [Maven 3.9+](https://maven.apache.org/) (per sviluppo locale)

## 🚀 Avvio Rapido

```bash
# Clona il repository
git clone https://github.com/delcarant/atti-amministrativi-platform.git
cd atti-amministrativi-platform

# Avvia tutti i servizi
cd infra/docker
docker compose up -d

# Verifica che tutti i servizi siano running
docker compose ps
```

## 🌐 Servizi e Porte

| Servizio | URL | Descrizione |
|---|---|---|
| Process Engine | http://localhost:8080 | Backend principale (Quarkus + Kogito) |
| Keycloak | http://localhost:8180 | Identity & Access Management |
| KIE Sandbox | http://localhost:9090 | Editor visuale BPMN/DMN |
| Frontend | http://localhost:3000 | Interfaccia utente React |
| Grafana | http://localhost:3001 | Dashboard di monitoring |
| Prometheus | http://localhost:9091 | Metriche applicative |

## 👥 Utenti di Test

| Username | Password | Ruolo |
|---|---|---|
| `mario.rossi` | `Password1!` | istruttore |
| `luigi.bianchi` | `Password1!` | ragioniere |
| `anna.verdi` | `Password1!` | dirigente |
| `admin` | `Password1!` | admin |

## 📚 Documentazione

- [Architettura del Sistema](docs/architettura.md)
- [Workflow Determinazione Dirigenziale](docs/workflow-determinazione.md)
- API Docs: http://localhost:8080/q/swagger-ui (dopo avvio)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza [Apache 2.0](LICENSE).
Piattaforma open source per atti amministrativi (Kogito + Quarkus + Keycloak)
