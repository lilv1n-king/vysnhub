-- Aktiviere die pgvector Extension (falls noch nicht aktiviert)
CREATE EXTENSION IF NOT EXISTS vector;

-- Erstelle die Tabelle für Artikel-Embeddings
CREATE TABLE IF NOT EXISTS article_embeddings (
    id SERIAL PRIMARY KEY,
    article_id TEXT NOT NULL,
    article_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Index für bessere Performance bei Ähnlichkeitssuchen
CREATE INDEX IF NOT EXISTS article_embeddings_embedding_idx 
ON article_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Erstelle Index für article_id für schnelle Lookups
CREATE INDEX IF NOT EXISTS article_embeddings_article_id_idx 
ON article_embeddings (article_id);

-- Erstelle Index für created_at für zeitbasierte Abfragen
CREATE INDEX IF NOT EXISTS article_embeddings_created_at_idx 
ON article_embeddings (created_at);

-- Beispiel-Abfrage für Ähnlichkeitssuche (Verwendung nach dem Einfügen von Daten)
-- SELECT article_id, article_text, metadata, 1 - (embedding <=> $1) AS similarity
-- FROM article_embeddings 
-- ORDER BY embedding <=> $1 
-- LIMIT 10; 