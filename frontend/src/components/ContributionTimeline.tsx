'use client'

import React from 'react'
import type { ContributionEntry } from '@/hooks/useMemberStats'
import { getRelativeTime } from '@/utils/avatarUtils'

interface ContributionTimelineProps {
  contributions: ContributionEntry[]
  isLoading?: boolean
}

const statusConfig = {
  confirmed: {
    dot: 'bg-emerald-500',
    label: 'Confirmed',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  pending: {
    dot: 'bg-amber-400',
    label: 'Pending',
    text: 'text-amber-600 dark:text-amber-400',
  },
  failed: {
    dot: 'bg-red-500',
    label: 'Failed',
    text: 'text-red-600 dark:text-red-400',
  },
}

export const ContributionTimeline: React.FC<ContributionTimelineProps> = ({
  contributions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading contribution history">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="skeleton w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="skeleton h-3.5 w-14 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (contributions.length === 0) {
    return (
      <p className="text-sm text-surface-400 dark:text-slate-500 italic py-2">
        No contributions yet
      </p>
    )
  }

  const recent = contributions.slice(-5).reverse()

  return (
    <ol className="relative space-y-0" aria-label="Contribution history">
      {recent.map((entry, i) => {
        const cfg = statusConfig[entry.status]
        return (
          <li key={i} className="flex items-start gap-3 group">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-white dark:ring-slate-800 ${cfg.dot}`} />
              {i < recent.length - 1 && (
                <span className="w-px flex-1 bg-surface-200 dark:bg-slate-700 my-1 min-h-[20px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-surface-900 dark:text-slate-100">
                  Cycle {entry.cycle}
                </span>
                <span className={`text-xs font-semibold ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-surface-400 dark:text-slate-500">
                  {entry.timestamp ? getRelativeTime(entry.timestamp) : '—'}
                </span>
                <span className="text-xs font-bold text-surface-800 dark:text-slate-200">
                  {entry.amount.toFixed(2)} XLM
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
