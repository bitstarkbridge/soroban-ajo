'use client'

import { motion } from 'framer-motion'
import { getLevelFloorXP, getLevelProgress } from '@/hooks/useGamification'

interface LevelProgressProps {
  level: number
  currentXp: number
  nextLevelXp: number
}

export function LevelProgress({ level, currentXp, nextLevelXp }: LevelProgressProps) {
  const floorXp = getLevelFloorXP(level)
  const progress = getLevelProgress(currentXp)
  const xpRemaining = Math.max(0, nextLevelXp - currentXp)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-200">
        <span>{floorXp.toLocaleString()} XP</span>
        <span>{nextLevelXp.toLocaleString()} XP</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex flex-col gap-1 text-sm text-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <span>{currentXp.toLocaleString()} XP banked</span>
        <span>{xpRemaining.toLocaleString()} XP to level {level + 1}</span>
      </div>
    </div>
  )
}
