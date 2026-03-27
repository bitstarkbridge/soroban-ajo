"use client";

import React from "react";
import { useInfiniteActivityFeed } from "@/hooks/useActivityFeed";
import { ActivityRecord, ActivityEventType } from "@/types/activity.types";
import { formatDistanceToNow } from "date-fns";

// ─── Event label + icon mapping ───────────────────────────────────────────────

const EVENT_META: Record<
  ActivityEventType,
  { label: (r: ActivityRecord) => string; icon: string; color: string }
> = {
  "group.created":           { icon: "🏦", color: "bg-blue-100 text-blue-700",   label: (r) => `${r.actor.displayName} created the group` },
  "group.updated":           { icon: "✏️", color: "bg-gray-100 text-gray-700",   label: (r) => `${r.actor.displayName} updated group settings` },
  "group.activated":         { icon: "✅", color: "bg-green-100 text-green-700", label: (r) => `Group activated by ${r.actor.displayName}` },
  "group.completed":         { icon: "🎉", color: "bg-purple-100 text-purple-700", label: () => "Group cycle completed" },
  "group.paused":            { icon: "⏸️", color: "bg-yellow-100 text-yellow-700", label: (r) => `Group paused by ${r.actor.displayName}` },
  "member.joined":           { icon: "👋", color: "bg-green-100 text-green-700", label: (r) => `${r.actor.displayName} joined the group` },
  "member.left":             { icon: "👋", color: "bg-gray-100 text-gray-600",   label: (r) => `${r.actor.displayName} left the group` },
  "member.removed":          { icon: "🚫", color: "bg-red-100 text-red-700",     label: (r) => `${r.actor.displayName} was removed` },
  "member.role_changed":     { icon: "🔄", color: "bg-blue-100 text-blue-700",   label: (r) => `${r.actor.displayName}'s role changed to ${r.metadata.newRole}` },
  "contribution.made":       { icon: "💰", color: "bg-green-100 text-green-700", label: (r) => `${r.actor.displayName} contributed ${r.metadata.amount} ${r.metadata.currency ?? "XLM"}` },
  "contribution.missed":     { icon: "⚠️", color: "bg-red-100 text-red-700",    label: (r) => `${r.actor.displayName} missed a contribution` },
  "contribution.late":       { icon: "🕐", color: "bg-yellow-100 text-yellow-700", label: (r) => `${r.actor.displayName} made a late contribution` },
  "distribution.scheduled":  { icon: "📅", color: "bg-blue-100 text-blue-700",   label: (r) => `Payout scheduled for ${r.metadata.recipientDisplayName}` },
  "distribution.completed":  { icon: "💸", color: "bg-green-100 text-green-700", label: (r) => `${r.metadata.recipientDisplayName} received ${r.metadata.amount} ${r.metadata.currency ?? "XLM"}` },
  "distribution.failed":     { icon: "❌", color: "bg-red-100 text-red-700",     label: (r) => `Payout to ${r.metadata.recipientDisplayName} failed` },
  "dispute.filed":           { icon: "⚖️", color: "bg-orange-100 text-orange-700", label: (r) => `${r.actor.displayName} filed a dispute` },
  "dispute.vote_cast":       { icon: "🗳️", color: "bg-blue-100 text-blue-700",   label: (r) => `${r.actor.displayName} voted on a dispute` },
  "dispute.resolved":        { icon: "✅", color: "bg-green-100 text-green-700", label: () => "Dispute resolved" },
  "dispute.escalated":       { icon: "🔺", color: "bg-red-100 text-red-700",     label: () => "Dispute escalated to admin" },
  "wallet.connected":        { icon: "🔗", color: "bg-gray-100 text-gray-700",   label: (r) => `${r.actor.displayName} connected a wallet` },
  "transaction.confirmed":   { icon: "✅", color: "bg-green-100 text-green-700", label: () => "Transaction confirmed on-chain" },
  "transaction.failed":      { icon: "❌", color: "bg-red-100 text-red-700",     label: () => "Transaction failed" },
};

// ─── Activity Item ────────────────────────────────────────────────────────────

function ActivityItem({ activity }: { activity: ActivityRecord }) {
  const meta = EVENT_META[activity.eventType] ?? {
    icon: "📌",
    color: "bg-gray-100 text-gray-700",
    label: () => activity.eventType,
  };

  return (
    <li className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Icon badge */}
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${meta.color}`}
        aria-hidden
      >
        {meta.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          {meta.label(activity)}
        </p>

        <div className="flex items-center gap-2 mt-0.5">
          <time
            dateTime={activity.createdAt}
            className="text-xs text-gray-500"
          >
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
            })}
          </time>

          {/* On-chain anchor */}
          {activity.txHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${activity.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline truncate max-w-[120px]"
              title={activity.txHash}
            >
              {activity.txHash.slice(0, 8)}…
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: ActivityEventType | "all" }[] = [
  { label: "All",           value: "all" },
  { label: "Contributions", value: "contribution.made" },
  { label: "Payouts",       value: "distribution.completed" },
  { label: "Members",       value: "member.joined" },
  { label: "Disputes",      value: "dispute.filed" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface ActivityFeedProps {
  groupId?: string;
  token: string;
  className?: string;
}

export function ActivityFeed({ groupId, token, className = "" }: ActivityFeedProps) {
  const [activeFilter, setActiveFilter] = React.useState<ActivityEventType | "all">("all");

  const eventTypes =
    activeFilter === "all" ? undefined : [activeFilter];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteActivityFeed({ groupId, token, eventTypes, limit: 20 });

  const allActivities =
    data?.pages.flatMap((p) => p.activities) ?? [];

  return (
    <section className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Activity Feed</h2>
        <span className="text-xs text-gray-400">
          {data?.pages[0]?.pagination.total ?? 0} events
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-100 overflow-x-auto">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === opt.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Feed list */}
      <div className="px-4">
        {isLoading && (
          <div className="py-8 text-center text-sm text-gray-400">
            Loading activity…
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load activity.{" "}
            <span className="text-gray-500">
              {(error as Error)?.message}
            </span>
          </div>
        )}

        {!isLoading && allActivities.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            No activity yet.
          </div>
        )}

        {allActivities.length > 0 && (
          <ul>
            {allActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </ul>
        )}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

export default ActivityFeed;