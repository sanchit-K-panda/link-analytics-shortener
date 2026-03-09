-- ============================================
-- LinkSnip — Neon PostgreSQL Setup
-- Run this in: Neon Console → SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  max_clicks INTEGER DEFAULT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  owner TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_owner ON links(owner);
