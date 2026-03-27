'use client'

import { motion } from 'framer-motion'
import { AchievementGrid } from '@/components/AchievementGrid'
import Leaderboard from '@/components/Leaderboard'
import { LevelProgress } from '@/components/LevelProgress'
import { useGamification } from '@/hooks/useGamification'

interface GamificationDashboardProps {
  walletAddress?: string
}

export function GamificationDashboard({ walletAddress }: GamificationDashboardProps) {
  const { loading, level, xp, rank, nextLevelXp, achievements, leaderboards, rewards, redeemReward } =
    useGamification(walletAddress)

  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length
  const redeemedRewards = rewards.filter((reward) => reward.status === 'redeemed').length
  const bestBoardPosition = Math.min(
    ...Object.values(leaderboards).map(
      (board) => board.find((entry) => entry.isCurrentUser)?.position ?? 99
    )
  )

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="space-y-4 rounded-3xl bg-slate-100 p-6">
            <div className="h-8 w-40 animate-pulse rounded bg-white" />
            <div className="h-4 w-56 animate-pulse rounded bg-white" />
            <div className="h-3 w-full animate-pulse rounded bg-white" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr,0.8fr]">
        <motion.div
          className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_36%),linear-gradient(135deg,_#0f172a,_#1d4ed8_55%,_#fb923c)] p-6 text-white shadow-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">
                  Gamification
                </p>
                <h2 className="mt-3 text-3xl font-bold">Level {level}</h2>
                <p className="mt-2 text-sm text-slate-200">Rank #{rank} across the network</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur">
                <div className="text-xs uppercase tracking-[0.28em] text-slate-200">Current XP</div>
                <div className="mt-2 text-3xl font-bold">{xp.toLocaleString()}</div>
              </div>
            </div>
            <LevelProgress level={level} currentXp={xp} nextLevelXp={nextLevelXp} />
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Achievements" value={String(unlockedAchievements)} detail="unlocked now" />
          <StatCard label="Reward Credits" value={String(redeemedRewards)} detail="already redeemed" />
          <StatCard label="Best Board" value={`#${bestBoardPosition}`} detail="current placement" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <AchievementGrid achievements={achievements} />
        <Leaderboard boards={leaderboards} />
      </div>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-500">
              Rewards
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Redeem what you earned</h3>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {xp.toLocaleString()} XP available
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {rewards.map((reward, index) => (
            <motion.article
              key={reward.id}
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{reward.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{reward.description}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  {reward.cost} XP
                </span>
              </div>

              <button
                onClick={() => redeemReward(reward.id)}
                disabled={reward.status !== 'available'}
                className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  reward.status === 'available'
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : reward.status === 'redeemed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {reward.status === 'available'
                  ? 'Redeem reward'
                  : reward.status === 'redeemed'
                    ? 'Redeemed'
                    : 'Locked'}
              </button>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <motion.div
      className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </motion.div>
  )
}
