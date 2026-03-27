'use client'

// Issue #408: Member profile cards with contribution history and reliability score
import React, { useState } from 'react'
import type { Member } from '@/types'
import { useMemberStats } from '@/hooks/useMemberStats'
import { MemberStats } from './MemberStats'
import { ContributionTimeline } from './ContributionTimeline'
import {
  generateAvatarColor,
  getAddressInitials,
  shortenAddress,
  formatDate,
} from '@/utils/avatarUtils'

interface MemberProfileCardProps {
  member: Member
  groupId: string
  /** Show as a compact inline card (e.g. inside a list) */
  compact?: boolean
}

export const MemberProfileCard: React.FC<MemberProfileCardProps> = ({
  member,
  groupId,
  compact = false,
}) => {
  const { stats, loading } = useMemberStats(member.address, groupId)
  const [expanded, setExpanded] = useState(false)

  const avatarColor = generateAvatarColor(member.address)
  const initials = getAddressInitials(member.address)
  const shortAddr = shortenAddress(member.address)

  const statusBadge = {
    active: 'badge badge-active',
    inactive: 'badge badge-paused',
    completed: 'badge badge-completed',
  }[member.status]

  const statusDot = {
    active: 'bg-emerald-500',
    inactive: 'bg-amber-400',
    completed: 'bg-primary-500',
  }[member.status]

  if (loading) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-surface-200/80 dark:border-slate-700 p-5"
        aria-busy="true"
        aria-label="Loading member profile"
      >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
        <div className="flex items-center gap-4">
          <div className="skeleton w-14 h-14 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-3.5 w-20 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        {!compact && (
          <div className="mt-5 space-y-3">
            <div className="skeleton h-2.5 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <article
      className={`
        relative overflow-hidden rounded-2xl
        bg-white dark:bg-slate-800
        border border-surface-200/80 dark:border-slate-700
        transition-all duration-300 ease-out
        hover:shadow-card-hover hover:-translate-y-0.5
        ${compact ? 'p-4' : 'p-5'}
      `}
    >
      {/* Gradient accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: avatarColor }}
      />

      {/* Creator badge */}
      {stats.isCreator && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
            👑 Creator
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-4 pt-1">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg select-none"
            style={{ backgroundColor: avatarColor }}
            aria-hidden="true"
          >
            {initials}
          </div>
          {/* Online dot */}
          <span
            className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${statusDot}`}
            aria-hidden="true"
          />
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-surface-900 dark:text-slate-100 font-mono truncate">
            {shortAddr}
          </p>
          <p className="text-xs text-surface-400 dark:text-slate-500 mt-0.5">
            Joined {formatDate(member.joinedDate)}
          </p>
          {/* Reliability inline */}
          <p className={`text-xs font-semibold mt-0.5 ${
            stats.reliabilityScore >= 90
              ? 'text-emerald-600 dark:text-emerald-400'
              : stats.reliabilityScore >= 70
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {stats.reliabilityScore}% reliable
          </p>
        </div>

        {/* Status badge */}
        <span className={`${statusBadge} flex-shrink-0`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot}`} />
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </span>
      </div>

      {/* Compact mode: just show stats inline, no expand */}
      {compact ? (
        <div className="mt-4">
          <MemberStats
            reliabilityScore={stats.reliabilityScore}
            totalContributed={stats.totalContributed}
            contributions={stats.contributions}
            cyclesCompleted={stats.cyclesCompleted}
            rank={stats.rank}
            achievements={stats.achievements}
          />
        </div>
      ) : (
        <>
          {/* Stats always visible */}
          <div className="mt-5">
            <MemberStats
              reliabilityScore={stats.reliabilityScore}
              totalContributed={stats.totalContributed}
              contributions={stats.contributions}
              cyclesCompleted={stats.cyclesCompleted}
              rank={stats.rank}
              achievements={stats.achievements}
            />
          </div>

          {/* Expandable timeline */}
          <div className="mt-4 border-t border-surface-100 dark:border-slate-700 pt-4">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-between w-full text-left group"
              aria-expanded={expanded}
              aria-controls={`timeline-${member.address}`}
            >
              <span className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                Contribution History
              </span>
              <svg
                className={`w-4 h-4 text-surface-400 dark:text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded && (
              <div
                id={`timeline-${member.address}`}
                className="mt-3 animate-fade-in"
              >
                <ContributionTimeline contributions={stats.history} />
              </div>
            )}
          </div>
        </>
      )}
    </article>
  )
}
