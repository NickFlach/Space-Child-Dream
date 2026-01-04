-- ============================================
-- SPACE CHILD PROFILE v2 — BIOFIELD EDITION
-- Database Migration
-- ============================================

-- Layer 1: Identity Core
CREATE TABLE IF NOT EXISTS identity_cores (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  chosen_name TEXT,
  identity_phrase TEXT,
  primary_field TEXT DEFAULT 'aurora',
  sigil_seed TEXT,
  sigil_geometry JSONB,
  visibility_state TEXT DEFAULT 'veiled',
  last_core_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_identity_cores_user_id ON identity_cores(user_id);

-- Layer 2: Heart States
CREATE TABLE IF NOT EXISTS heart_states (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL,
  is_inferred BOOLEAN DEFAULT FALSE,
  inference_source TEXT,
  confidence REAL DEFAULT 1.0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_heart_states_user_id ON heart_states(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_states_started_at ON heart_states(started_at);

-- Layer 3: Biofield States
CREATE TABLE IF NOT EXISTS biofield_states (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL,
  uncertainty REAL DEFAULT 0.5,
  signals JSONB,
  is_overridden BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_biofield_states_user_id ON biofield_states(user_id);
CREATE INDEX IF NOT EXISTS idx_biofield_states_recorded_at ON biofield_states(recorded_at);

-- Biofield Integrations (Wearable Connections)
CREATE TABLE IF NOT EXISTS biofield_integrations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_paused BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMP,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_biofield_integrations_user_id ON biofield_integrations(user_id);

-- Layer 4: Consciousness Graph - Nodes
CREATE TABLE IF NOT EXISTS consciousness_nodes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  depth REAL DEFAULT 0,
  last_engaged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consciousness_nodes_user_id ON consciousness_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_nodes_domain ON consciousness_nodes(domain);

-- Layer 4: Consciousness Graph - Edges
CREATE TABLE IF NOT EXISTS consciousness_edges (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source_domain TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  strength REAL DEFAULT 0,
  synthesis_count REAL DEFAULT 0,
  last_synthesis_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consciousness_edges_user_id ON consciousness_edges(user_id);

-- Layer 5: Artifacts
CREATE TABLE IF NOT EXISTS artifacts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  content JSONB,
  origin_heart_state TEXT,
  origin_biofield_state TEXT,
  domains JSONB DEFAULT '[]',
  visibility_state TEXT DEFAULT 'veiled',
  fade_level REAL DEFAULT 1.0,
  last_revisited_at TIMESTAMP,
  crystallized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_crystallized_at ON artifacts(crystallized_at);

-- Profile Settings
CREATE TABLE IF NOT EXISTS profile_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  biofield_opt_in BOOLEAN DEFAULT FALSE,
  heart_state_auto_infer BOOLEAN DEFAULT TRUE,
  artifact_auto_fade BOOLEAN DEFAULT TRUE,
  artifact_fade_days REAL DEFAULT 90,
  show_biofield_on_profile BOOLEAN DEFAULT FALSE,
  reduce_motion BOOLEAN DEFAULT FALSE,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_settings_user_id ON profile_settings(user_id);
