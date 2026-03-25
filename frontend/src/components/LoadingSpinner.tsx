/**
 * LoadingSpinner - improved spinner with multiple variants
 * Replaces generic spinners with accessible, styled alternatives
 */
import React from 'react'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'
type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'progress'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
  /** Progress value 0-100 (only for 'progress' variant) */
  progress?: number
  className?: string
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

const dotSizeMap: Record<SpinnerSize, string> = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  label = 'Loading...',
  progress,
  className = '',
}) => {
  if (variant === 'dots') {
    return (
      <span
        role="status"
        aria-label={label}
        className={`inline-flex items-center gap-1 ${className}`}
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className={`${dotSizeMap[size]} rounded-full bg-primary-500 animate-bounce`}
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  if (variant === 'pulse') {
    return (
      <span
        role="status"
        aria-label={label}
        className={`inline-flex items-center justify-center ${className}`}
      >
        <span
          className={`${dotSizeMap[size]} rounded-full bg-primary-500 animate-pulse-slow`}
        />
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  if (variant === 'progress') {
    return (
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full h-1.5 bg-surface-200 dark:bg-slate-700 rounded-full overflow-hidden ${className}`}
      >
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: progress !== undefined ? `${progress}%` : '60%' }}
        />
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  // Default: spinner
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block ${sizeMap[size]} rounded-full border-surface-200 border-t-primary-500 animate-spin ${className}`}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** Inline button spinner - drop-in for button loading states */
export const ButtonSpinner: React.FC<{ size?: SpinnerSize }> = ({ size = 'sm' }) => (
  <LoadingSpinner size={size} variant="spinner" label="Loading" />
)
