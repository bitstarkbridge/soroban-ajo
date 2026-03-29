/**
 * Reliability Score Component
 * 
 * Displays a visual representation of a member's reliability score
 * with progress indicators, trends, and detailed breakdowns.
 */

import React, { useMemo } from 'react'
import { useMemberPenaltyRecord } from '../../hooks/usePenaltyStats'
import { MemberPenaltyRecord } from '../../types'
import { getReliabilityScoreColor, getReliabilityScoreLabel } from '../../hooks/usePenaltyStats'
import { LoadingSpinner } from '../LoadingSpinner'

interface ReliabilityScoreProps {
  groupId: string
  member: string
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  showTrend?: boolean
  className?: string
}

interface CircularProgressProps {
  value: number
  size: number
  strokeWidth: number
  color: string
  backgroundColor?: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size,
  strokeWidth,
  color,
  backgroundColor = '#e5e7eb'
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-bold"
          style={{ 
            fontSize: size / 4,
            color 
          }}
        >
          {Math.round(value)}%
        </span>
      </div>
    </div>
  )
}

interface ScoreBadgeProps {
  score: number
  size?: 'small' | 'medium'
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'medium' }) => {
  const color = getReliabilityScoreColor(score)
  const label = getReliabilityScoreLabel(score)
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm'
  }

  return (
    <div 
      className={`inline-flex items-center space-x-1 rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <div 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium">{label}</span>
    </div>
  )
}

interface ScoreTrendProps {
  currentScore: number
  previousScore?: number
}

const ScoreTrend: React.FC<ScoreTrendProps> = ({ currentScore, previousScore }) => {
  if (previousScore === undefined) return null

  const change = currentScore - previousScore
  const isPositive = change >= 0

  return (
    <div className="flex items-center space-x-1">
      <span 
        className={`text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? '↑' : '↓'} {Math.abs(change)}%
      </span>
      <span className="text-xs text-gray-500">
        from last period
      </span>
    </div>
  )
}

interface ScoreBreakdownProps {
  penaltyRecord: MemberPenaltyRecord
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ penaltyRecord }) => {
  const totalContributions = penaltyRecord.lateCount + penaltyRecord.onTimeCount
  const onTimePercentage = totalContributions > 0 
    ? (penaltyRecord.onTimeCount / totalContributions) * 100 
    : 100

  return (
    <div className="space-y-3">
      {/* Contribution Breakdown */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">On-Time Contributions</span>
          <span className="font-medium">{penaltyRecord.onTimeCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${onTimePercentage}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Late Contributions</span>
          <span className="font-medium">{penaltyRecord.lateCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${100 - onTimePercentage}%` }}
          />
        </div>
      </div>

      {/* Penalty Summary */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Penalties</span>
          <span className="font-medium text-red-600">
            ${penaltyRecord.totalPenalties}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Total Contributions</span>
          <span className="font-medium">{totalContributions}</span>
        </div>
      </div>
    </div>
  )
}

export const ReliabilityScore: React.FC<ReliabilityScoreProps> = ({
  groupId,
  member,
  size = 'medium',
  showDetails = false,
  showTrend = false,
  className = ''
}) => {
  const { data: penaltyRecord, isLoading } = useMemberPenaltyRecord(groupId, member)

  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return { circle: 60, strokeWidth: 4 }
      case 'large':
        return { circle: 120, strokeWidth: 8 }
      default:
        return { circle: 80, strokeWidth: 6 }
    }
  }, [size])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LoadingSpinner size="small" />
      </div>
    )
  }

  if (!penaltyRecord) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        <p className="text-sm">No penalty data available</p>
      </div>
    )
  }

  const score = penaltyRecord.reliabilityScore
  const color = getReliabilityScoreColor(score)

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Circular Progress */}
      <CircularProgress
        value={score}
        size={sizeConfig.circle}
        strokeWidth={sizeConfig.strokeWidth}
        color={color}
      />

      {/* Score Badge */}
      <ScoreBadge score={score} size={size} />

      {/* Trend */}
      {showTrend && (
        <ScoreTrend 
          currentScore={score}
          // TODO: Get previous score from historical data
          previousScore={undefined}
        />
      )}

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="w-full max-w-sm">
          <ScoreBreakdown penaltyRecord={penaltyRecord} />
        </div>
      )}

      {/* Member Info */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          {member.slice(0, 6)}...{member.slice(-4)}
        </p>
        <p className="text-xs text-gray-500">
          Group {groupId}
        </p>
      </div>
    </div>
  )
}

// Compact version for use in tables and lists
interface ReliabilityScoreCompactProps {
  score: number
  size?: 'small' | 'medium'
  showLabel?: boolean
  className?: string
}

export const ReliabilityScoreCompact: React.FC<ReliabilityScoreCompactProps> = ({
  score,
  size = 'small',
  showLabel = true,
  className = ''
}) => {
  const color = getReliabilityScoreColor(score)
  const label = getReliabilityScoreLabel(score)

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span 
          className={`font-medium ${sizeClasses[size]}`}
          style={{ color }}
        >
          {score}%
        </span>
      </div>
      {showLabel && (
        <span className={`text-gray-500 ${sizeClasses[size]}`}>
          {label}
        </span>
      )}
    </div>
  )
}
