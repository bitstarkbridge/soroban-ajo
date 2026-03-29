/**
 * Penalty Dashboard Component
 * 
 * Displays comprehensive penalty statistics, member reliability scores,
 * and penalty tracking information for a group.
 */

import React, { useMemo } from 'react'
import { Card } from '../Card'
import { useGroupPenaltyStats, useMemberPenaltyRecord, usePenaltyHistory } from '../../hooks/usePenaltyStats'
import { useGroupMembers } from '../../hooks/useContractData'
import { useAuth } from '../../hooks/useAuth'
import { PenaltyStats, MemberPenaltyRecord } from '../../types'
import { LoadingSpinner } from '../LoadingSpinner'
import { getReliabilityScoreColor, getReliabilityScoreLabel } from '../../hooks/usePenaltyStats'

interface PenaltyDashboardProps {
  groupId: string
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = '#3b82f6',
  trend 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p 
            className="text-2xl font-bold mt-1"
            style={{ color }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}

interface MemberReliabilityRowProps {
  member: string
  groupId: string
  isCurrentUser?: boolean
}

const MemberReliabilityRow: React.FC<MemberReliabilityRowProps> = ({ 
  member, 
  groupId,
  isCurrentUser = false 
}) => {
  const { data: penaltyRecord, isLoading } = useMemberPenaltyRecord(groupId, member)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    )
  }

  const score = penaltyRecord?.reliabilityScore || 100
  const scoreColor = getReliabilityScoreColor(score)
  const scoreLabel = getReliabilityScoreLabel(score)

  return (
    <div className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 ${
      isCurrentUser ? 'bg-blue-50' : ''
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">
            {member.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {member.slice(0, 6)}...{member.slice(-4)}
            {isCurrentUser && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                You
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{scoreLabel}</p>
        </div>
      </div>
      <div className="text-right">
        <p 
          className="text-lg font-bold"
          style={{ color: scoreColor }}
        >
          {score}%
        </p>
        <p className="text-xs text-gray-500">
          {penaltyRecord?.lateCount || 0} late
        </p>
      </div>
    </div>
  )
}

export const PenaltyDashboard: React.FC<PenaltyDashboardProps> = ({ 
  groupId, 
  className = '' 
}) => {
  const { user } = useAuth()
  const { data: penaltyStats, isLoading: statsLoading } = useGroupPenaltyStats(groupId)
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId)
  const { data: penaltyHistory, isLoading: historyLoading } = usePenaltyHistory(groupId, undefined, { limit: 5 })

  const sortedMembers = useMemo(() => {
    if (!members) return []
    
    return [...members].sort((a, b) => {
      // Put current user first
      if (user?.address === a.address) return -1
      if (user?.address === b.address) return 1
      return 0
    })
  }, [members, user?.address])

  const isLoading = statsLoading || membersLoading || historyLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = penaltyStats || {
    totalPenalties: 0,
    averageReliabilityScore: 100,
    totalLateContributions: 0,
    totalOnTimeContributions: 0,
    membersWithPenalties: 0,
    totalMembers: 0,
  }

  const averageScore = stats.averageReliabilityScore
  const averageScoreColor = getReliabilityScoreColor(averageScore)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Reliability"
          value={`${Math.round(averageScore)}%`}
          subtitle={getReliabilityScoreLabel(averageScore)}
          color={averageScoreColor}
        />
        <StatCard
          title="Total Penalties"
          value={stats.totalPenalties}
          subtitle={`${stats.membersWithPenalties} members affected`}
          color="#ef4444"
        />
        <StatCard
          title="On-Time Contributions"
          value={stats.totalOnTimeContributions}
          subtitle={`${Math.round((stats.totalOnTimeContributions / (stats.totalOnTimeContributions + stats.totalLateContributions)) * 100)}% rate`}
          color="#10b981"
        />
        <StatCard
          title="Late Contributions"
          value={stats.totalLateContributions}
          subtitle={`${Math.round((stats.totalLateContributions / (stats.totalOnTimeContributions + stats.totalLateContributions)) * 100)}% rate`}
          color="#f59e0b"
        />
      </div>

      {/* Member Reliability Scores */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Reliability Scores</h3>
        <div className="space-y-1">
          {sortedMembers.map((member) => (
            <MemberReliabilityRow
              key={member.address}
              member={member.address}
              groupId={groupId}
              isCurrentUser={user?.address === member.address}
            />
          ))}
          {(!members || members.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No members found
            </div>
          )}
        </div>
      </Card>

      {/* Recent Penalty History */}
      {penaltyHistory && penaltyHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Penalty Activity</h3>
          <div className="space-y-3">
            {penaltyHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.isLate ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.member.slice(0, 6)}...{item.member.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cycle {item.cycle} • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    item.isLate ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.isLate ? `+$${item.penaltyAmount}` : 'On time'}
                  </p>
                  {item.reason && (
                    <p className="text-xs text-gray-500">{item.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Group Health</h4>
            <p className="text-xs text-blue-700">
              {averageScore >= 90 
                ? 'Excellent group performance with high member reliability.'
                : averageScore >= 75
                ? 'Good group performance with room for improvement.'
                : 'Group needs attention to improve contribution timeliness.'
              }
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Recommendations</h4>
            <p className="text-xs text-amber-700">
              {stats.totalLateContributions > 0
                ? `Consider setting up contribution reminders to reduce ${stats.totalLateContributions} late payments.`
                : 'Maintain current contribution discipline to sustain high reliability scores.'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
