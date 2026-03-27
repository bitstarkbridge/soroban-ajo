/**
 * SkeletonCard - matches GroupCard layout
 * Used while group card data is loading
 */
import React from 'react'

interface SkeletonCardProps {
  /** Number of cards to render */
  count?: number
  variant?: 'default' | 'compact' | 'spacious'
}

const SingleSkeletonCard: React.FC<{ variant: string }> = ({ variant }) => {
  const isCompact = variant === 'compact'
  const isSpaciousOrElevated = variant === 'spacious'

  const cardClass =
    variant === 'compact'
      ? 'card-compact'
      : variant === 'spacious'
        ? 'card-spacious'
        : 'card-interactive'

  return (
    <div
      className={`${cardClass} pointer-events-none relative overflow-hidden`}
      aria-busy="true"
      aria-label="Loading group card"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 skeleton rounded-none" />

      {/* Header */}
      <div className={`flex justify-between items-start ${isCompact ? 'mb-3' : 'mb-5'} pt-1`}>
        <div
          className={`skeleton rounded-lg ${isCompact ? 'h-5 w-1/2' : isSpaciousOrElevated ? 'h-7 w-2/3' : 'h-6 w-1/2'}`}
        />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>

      {/* Body */}
      <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
        <div className="flex justify-between items-center">
          <div className="skeleton h-3.5 w-14 rounded" />
          <div className="skeleton h-3.5 w-10 rounded" />
        </div>
        <div className="progress-bar">
          <div className="skeleton h-full w-full rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton h-3.5 w-16 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="skeleton h-3.5 w-20 rounded" />
          <div className="skeleton h-3.5 w-24 rounded" />
        </div>
      </div>

      {/* Button */}
      <div className={`skeleton w-full rounded-xl ${isCompact ? 'mt-4 h-9' : 'mt-5 h-10'}`} />
    </div>
  )
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  variant = 'default',
}) => {
  if (count === 1) return <SingleSkeletonCard variant={variant} />

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeletonCard key={i} variant={variant} />
      ))}
    </>
  )
}
