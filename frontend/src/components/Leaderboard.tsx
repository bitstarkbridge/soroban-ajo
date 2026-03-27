'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LeaderboardEntry as LeaderboardRow } from '@/hooks/useGamification'

interface LeaderboardProps {
  boards: {
    global: LeaderboardRow[]
    group: LeaderboardRow[]
    friends: LeaderboardRow[]
  }
}

type LeaderboardScope = 'global' | 'group' | 'friends'

const scopeLabels: Record<LeaderboardScope, string> = {
  global: 'Global',
  group: 'Group',
  friends: 'Friends',
}

export default function Leaderboard({ boards }: LeaderboardProps) {
  const [scope, setScope] = useState<LeaderboardScope>('global')
  const rows = boards[scope]

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">
            Leaderboards
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">See how you stack up</h3>
        </div>
        <div className="inline-flex rounded-2xl bg-slate-100 p-1">
          {Object.keys(scopeLabels).map((value) => {
            const typedValue = value as LeaderboardScope
            const active = typedValue === scope
            return (
              <button
                key={typedValue}
                onClick={() => setScope(typedValue)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {scopeLabels[typedValue]}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scope}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="space-y-3"
        >
          {rows.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                entry.isCurrentUser
                  ? 'border-sky-200 bg-sky-50'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                #{entry.position}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{entry.name}</p>
                  {entry.isCurrentUser && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                      You
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">Level {entry.level}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{entry.xp.toLocaleString()} XP</div>
                <div
                  className={`text-xs font-semibold ${
                    entry.change >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {entry.change >= 0 ? '+' : ''}
                  {entry.change} positions
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
