'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Achievement } from '@/hooks/useGamification'
import {
  buildAchievementSharePayload,
  copyToClipboard,
  shareContentViaTelegram,
  shareContentViaTwitter,
  shareContentViaWebShare,
  shareContentViaWhatsApp,
} from '@/utils/shareUtils'

interface AchievementGridProps {
  achievements: Achievement[]
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [recentlySharedId, setRecentlySharedId] = useState<string | null>(null)
  const unlockedCount = useMemo(
    () => achievements.filter((achievement) => achievement.unlocked).length,
    [achievements]
  )

  const shareUrl = typeof window !== 'undefined' ? window.location.href : undefined

  const handleCopyShare = async (achievement: Achievement) => {
    const payload = buildAchievementSharePayload(achievement.title, achievement.xpReward, shareUrl)
    const copied = await copyToClipboard(`${payload.text} ${payload.url ?? ''}`.trim())

    if (copied) {
      setRecentlySharedId(achievement.id)
      window.setTimeout(() => setRecentlySharedId(null), 1800)
    }
  }

  const handleWebShare = async (achievement: Achievement) => {
    const payload = buildAchievementSharePayload(achievement.title, achievement.xpReward, shareUrl)
    const shared = await shareContentViaWebShare(payload)

    if (shared) {
      setRecentlySharedId(achievement.id)
      window.setTimeout(() => setRecentlySharedId(null), 1800)
    }
  }

  useEffect(() => {
    if (!achievements.some((achievement) => achievement.recentlyUnlocked)) {
      return
    }

    setShowCelebration(true)
    const timer = window.setTimeout(() => setShowCelebration(false), 1800)
    return () => window.clearTimeout(timer)
  }, [achievements])

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 18 }).map((_, index) => (
              <motion.span
                key={index}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-orange-400"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
                animate={{
                  x: Math.cos((index / 18) * Math.PI * 2) * (70 + index * 2),
                  y: Math.sin((index / 18) * Math.PI * 2) * (55 + index * 3),
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
            Achievements
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Your trophy shelf</h3>
        </div>
        <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right">
          <div className="text-2xl font-bold text-orange-600">{unlockedCount}</div>
          <div className="text-xs text-slate-500">unlocked</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement, index) => {
          const progress = Math.min(100, (achievement.current / achievement.target) * 100)
          return (
            <motion.article
              key={achievement.id}
              className={`rounded-2xl border p-4 transition-colors ${
                achievement.unlocked
                  ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50'
                  : 'border-slate-200 bg-slate-50/80'
              }`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {achievement.icon}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                    achievement.unlocked
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {achievement.unlocked ? 'Unlocked' : 'In progress'}
                </span>
              </div>

              <h4 className="mt-4 text-lg font-semibold text-slate-900">{achievement.title}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">{achievement.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>
                    {achievement.current}/{achievement.target}
                  </span>
                  <span>+{achievement.xpReward} XP</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-slate-900 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {achievement.unlocked && (
                <div className="mt-4 rounded-xl border border-orange-200/80 bg-white/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                    Share milestone
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      onClick={() =>
                        shareContentViaTwitter(
                          buildAchievementSharePayload(
                            achievement.title,
                            achievement.xpReward,
                            shareUrl
                          )
                        )
                      }
                      className="rounded-lg bg-slate-900 px-2 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      X
                    </button>
                    <button
                      onClick={() =>
                        shareContentViaWhatsApp(
                          buildAchievementSharePayload(
                            achievement.title,
                            achievement.xpReward,
                            shareUrl
                          )
                        )
                      }
                      className="rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() =>
                        shareContentViaTelegram(
                          buildAchievementSharePayload(
                            achievement.title,
                            achievement.xpReward,
                            shareUrl
                          )
                        )
                      }
                      className="rounded-lg bg-sky-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
                    >
                      Telegram
                    </button>
                    <button
                      onClick={() => handleCopyShare(achievement)}
                      className="rounded-lg bg-orange-500 px-2 py-2 text-xs font-semibold text-white transition hover:bg-orange-400"
                    >
                      {recentlySharedId === achievement.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={() => handleWebShare(achievement)}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Share via device
                    </button>
                  )}
                </div>
              )}
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
