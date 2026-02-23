-- Inizializzazione database atti_amministrativi
-- Script eseguito automaticamente al primo avvio del container PostgreSQL

-- Tabella per il log di audit di tutte le operazioni sugli atti
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    process_instance_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    details TEXT
);

-- Indici per ottimizzare le query di ricerca più frequenti
CREATE INDEX IF NOT EXISTS idx_audit_process ON audit_log(process_instance_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);

-- Commento sulla tabella per documentazione
COMMENT ON TABLE audit_log IS 'Log di audit per tracciare tutte le operazioni sugli atti amministrativi';
COMMENT ON COLUMN audit_log.event_type IS 'Tipo di evento: PROCESSO_AVVIATO, TASK_COMPLETATO, ATTO_PUBBLICATO, etc.';
