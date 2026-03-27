// ─── Activity Event Types ─────────────────────────────────────────────────────

export type ActivityEventType =
  // Group lifecycle
  | "group.created"
  | "group.updated"
  | "group.activated"
  | "group.completed"
  | "group.paused"
  // Member actions
  | "member.joined"
  | "member.left"
  | "member.removed"
  | "member.role_changed"
  // Contributions
  | "contribution.made"
  | "contribution.missed"
  | "contribution.late"
  // Distributions / payouts
  | "distribution.scheduled"
  | "distribution.completed"
  | "distribution.failed"
  // Disputes
  | "dispute.filed"
  | "dispute.vote_cast"
  | "dispute.resolved"
  | "dispute.escalated"
  // Wallet / blockchain
  | "wallet.connected"
  | "transaction.confirmed"
  | "transaction.failed";

// ─── Actor ───────────────────────────────────────────────────────────────────

export interface ActivityActor {
  userId: string;
  displayName: string;
  walletAddress?: string;
  avatarUrl?: string;
}

// ─── Metadata per event type ─────────────────────────────────────────────────

export interface ActivityMetadata {
  // Group fields
  groupId?: string;
  groupName?: string;
  // Contribution fields
  amount?: string;         // stringified XLM amount
  currency?: string;       // default "XLM"
  contributionRound?: number;
  // Distribution fields
  recipientUserId?: string;
  recipientDisplayName?: string;
  // Dispute fields
  disputeId?: string;
  disputeReason?: string;
  resolution?: string;
  // Transaction fields
  txHash?: string;
  txLedger?: number;
  // Role change
  oldRole?: string;
  newRole?: string;
  // Generic extra context
  [key: string]: unknown;
}

// ─── Core Activity Record ─────────────────────────────────────────────────────

export interface ActivityRecord {
  id: string;
  eventType: ActivityEventType;
  actor: ActivityActor;
  groupId: string;         // every activity belongs to a group
  metadata: ActivityMetadata;
  createdAt: string;       // ISO-8601
  txHash?: string;         // blockchain anchor (optional)
}

// ─── Feed Query Params ────────────────────────────────────────────────────────

export interface ActivityFeedQuery {
  groupId?: string;
  userId?: string;
  eventTypes?: ActivityEventType[];
  before?: string;         // cursor (ISO-8601 timestamp)
  after?: string;          // cursor (ISO-8601 timestamp)
  limit?: number;          // 1–100, default 20
  page?: number;
}

// ─── Feed Response ────────────────────────────────────────────────────────────

export interface ActivityFeedResponse {
  activities: ActivityRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}