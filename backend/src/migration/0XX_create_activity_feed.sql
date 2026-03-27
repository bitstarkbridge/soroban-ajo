-- Migration: Create activity_feed table
-- Issue #395 — Activity Feed
-- Run: psql -d ajo -f 0XX_create_activity_feed.sql

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_feed (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event classification
  event_type           TEXT          NOT NULL,

  -- Actor (denormalised for read performance — no JOIN needed on feed queries)
  actor_user_id        UUID          NOT NULL,
  actor_display_name   TEXT          NOT NULL,
  actor_wallet_address TEXT,
  actor_avatar_url     TEXT,

  -- Scope
  group_id             UUID          NOT NULL
                         REFERENCES groups(id) ON DELETE CASCADE,

  -- Flexible payload
  metadata             JSONB         NOT NULL DEFAULT '{}',

  -- Optional blockchain anchor
  tx_hash              TEXT,

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Constraints ───────────────────────────────────────────────────────────────

-- Validate event_type against the known set
ALTER TABLE activity_feed
  ADD CONSTRAINT activity_feed_event_type_check
  CHECK (event_type IN (
    'group.created',       'group.updated',       'group.activated',
    'group.completed',     'group.paused',
    'member.joined',       'member.left',         'member.removed',
    'member.role_changed',
    'contribution.made',   'contribution.missed', 'contribution.late',
    'distribution.scheduled', 'distribution.completed', 'distribution.failed',
    'dispute.filed',       'dispute.vote_cast',   'dispute.resolved',
    'dispute.escalated',
    'wallet.connected',    'transaction.confirmed', 'transaction.failed'
  ));

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Primary feed query: group feed ordered by time
CREATE INDEX idx_activity_feed_group_time
  ON activity_feed (group_id, created_at DESC);

-- User-scoped feed
CREATE INDEX idx_activity_feed_actor_time
  ON activity_feed (actor_user_id, created_at DESC);

-- Event type filtering (used with group filter)
CREATE INDEX idx_activity_feed_event_type
  ON activity_feed (event_type, created_at DESC);

-- Blockchain tx lookup
CREATE INDEX idx_activity_feed_tx_hash
  ON activity_feed (tx_hash)
  WHERE tx_hash IS NOT NULL;

-- JSONB metadata queries (e.g. filter by disputeId or recipientUserId)
CREATE INDEX idx_activity_feed_metadata
  ON activity_feed USING GIN (metadata);

-- ── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE activity_feed IS
  'Append-only log of all meaningful actions in the Ajo platform. '
  'Actor fields are denormalised for feed read performance.';

COMMENT ON COLUMN activity_feed.metadata IS
  'Flexible JSONB payload. Shape varies by event_type — see ActivityMetadata in '
  'backend/src/types/activity.types.ts for the full schema.';

COMMENT ON COLUMN activity_feed.tx_hash IS
  'Stellar transaction hash that anchors this event on-chain, if applicable.';