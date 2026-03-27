'use client'

import React from 'react'
import type { Achievement } from '@/hooks/useMemberStats'

interface MemberStatsProps {
  reliabilityScore: number
  totalContributed: number
  contributions: number
  cyclesCompleted: number
  rank: number
  achievements: Achievement[]
  isLoading?: boolean
}

const achievementIcons: Record<string, string> = {
  first_contribution: '🌱',
  perfect_streak: '⚡',
  early_bird: '🐦',
  top_contributor: '🏆',
  veteran: '🎖️',
}

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function scoreBarColor(score: number): string {
  if (score >= 90) return 'from-emerald-400 to-teal-500'
  if (score >= 70) return 'from-amber-400 to-orange-500'
  return 'from-red-400 to-rose-500'
}

export const MemberStats: React.FC<MemberStatsProps> = ({
  reliabilityScore,
  totalContributed,
  contributions,
  cyclesCompleted,
  rank,
  achievements,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-2.5 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-7 w-16 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  const earned = achievements.filter((a) => a.earned)

  return (
    <div className="space-y-4">
      {/* Reliability score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
            Reliability
          </span>
          <span className={`text-sm font-extrabold ${scoreColor(reliabilityScore)}`}>
            {reliabilityScore}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(reliabilityScore)} transition-all duration-700`}
            style={{ width: `${reliabilityScore}%` }}
            role="progressbar"
            aria-valuenow={reliabilityScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Reliability score: ${reliabilityScore}%`}
          />
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Contributed', value: `${totalContributed.toFixed(1)} XLM` },
          { label: 'Cycles', value: cyclesCompleted },
          { label: 'Rank', value: `#${rank}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center border border-surface-100 dark:border-slate-700"
          >
            <p className="text-xs text-surface-400 dark:text-slate-500 font-medium">{label}</p>
            <p className="text-sm font-bold text-surface-900 dark:text-slate-100 mt-0.5 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {earned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Achievements
          </p>
          <div className="flex flex-wrap gap-1.5">
            {earned.map((a) => (
              <span
                key={a.id}
                title={a.description}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-indigo-900/30 text-primary-700 dark:text-indigo-300 border border-primary-100 dark:border-indigo-800"
              >
                <span aria-hidden="true">{achievementIcons[a.id]}</span>
                {a.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
