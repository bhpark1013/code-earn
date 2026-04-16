-- CodeEarn Supabase Schema
-- Run this in the Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  total_earnings DECIMAL(10, 6) DEFAULT 0,
  pending_payout DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad sessions table
CREATE TABLE ad_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  earning DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_ad_sessions_user_id ON ad_sessions(user_id);
CREATE INDEX idx_ad_sessions_created_at ON ad_sessions(created_at);
CREATE INDEX idx_users_api_key ON users(api_key);

-- Function to increment earnings atomically
CREATE OR REPLACE FUNCTION increment_earnings(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_earnings = total_earnings + p_amount,
      pending_payout = pending_payout + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sessions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API)
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ad_sessions"
  ON ad_sessions FOR ALL
  USING (auth.role() = 'service_role');
