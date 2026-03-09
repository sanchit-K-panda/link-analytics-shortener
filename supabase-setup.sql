-- ============================================
-- LinkSnip — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create the links table
CREATE TABLE IF NOT EXISTS links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  max_clicks INTEGER DEFAULT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NULL
);

-- 2. Index for fast redirect lookup
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);

-- 3. Enable Row-Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Authenticated users can manage their own links
CREATE POLICY "Users manage own links" ON links
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. RLS Policy: Anyone can read any link (needed for redirect)
CREATE POLICY "Public can read links" ON links
  FOR SELECT
  USING (true);

-- 6. RPC Function: Increment clicks (bypasses RLS for unauthenticated visitors)
-- This is needed because visitors clicking short links are not logged in,
-- so they can't update the links table directly due to RLS.
CREATE OR REPLACE FUNCTION increment_click(p_short_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner privileges, bypassing RLS
AS $$
BEGIN
  UPDATE links
  SET clicks = clicks + 1,
      last_accessed_at = NOW()
  WHERE short_code = p_short_code;
END;
$$;
