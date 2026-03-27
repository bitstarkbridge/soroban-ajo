/**
 * SkeletonProfile - matches ProfileCard layout
 */
import React from 'react'

export const SkeletonProfile: React.FC = () => {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 relative overflow-hidden"
      aria-busy="true"
      aria-label="Loading profile"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

      {/* Avatar + info row */}
      <div className="flex items-start gap-6">
        <div className="skeleton w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="skeleton h-8 w-16 rounded mx-auto" />
            <div className="skeleton h-3.5 w-20 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
