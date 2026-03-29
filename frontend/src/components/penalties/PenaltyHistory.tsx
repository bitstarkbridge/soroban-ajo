/**
 * Penalty History Component
 * 
 * Displays detailed penalty history for a group or specific member
 * with filtering, sorting, and visualization options.
 */

import React, { useState, useMemo } from 'react'
import { Card } from '../Card'
import { usePenaltyHistory } from '../../hooks/usePenaltyStats'
import { PenaltyHistoryItem } from '../../types'
import { LoadingSpinner } from '../LoadingSpinner'
import { Button } from '../Button'
import { Input } from '../Input'
import { getReliabilityScoreColor } from '../../hooks/usePenaltyStats'

interface PenaltyHistoryProps {
  groupId: string
  member?: string
  showFilters?: boolean
  showExport?: boolean
  limit?: number
  className?: string
}

type FilterType = 'all' | 'late' | 'on-time'
type SortType = 'date' | 'amount' | 'member' | 'cycle'
type SortDirection = 'asc' | 'desc'

interface FilterBarProps {
  filter: FilterType
  sort: SortType
  sortDirection: SortDirection
  searchQuery: string
  onFilterChange: (filter: FilterType) => void
  onSortChange: (sort: SortType) => void
  onSortDirectionChange: (direction: SortDirection) => void
  onSearchChange: (query: string) => void
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  sort,
  sortDirection,
  searchQuery,
  onFilterChange,
  onSortChange,
  onSortDirectionChange,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Search */}
      <div className="flex-1">
        <Input
          placeholder="Search by member address..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'late', 'on-time'] as FilterType[]).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'primary' : 'outline'}
            size="small"
            onClick={() => onFilterChange(filterType)}
          >
            {filterType === 'all' ? 'All' : filterType === 'late' ? 'Late' : 'On Time'}
          </Button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="member">Member</option>
          <option value="cycle">Cycle</option>
        </select>
        <Button
          variant="outline"
          size="small"
          onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
    </div>
  )
}

interface PenaltyHistoryRowProps {
  item: PenaltyHistoryItem
  isCurrentUser?: boolean
}

const PenaltyHistoryRow: React.FC<PenaltyHistoryRowProps> = ({ 
  item, 
  isCurrentUser = false 
}) => {
  const isLate = item.isLate
  const color = isLate ? '#ef4444' : '#10b981'

  return (
    <div className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
      isCurrentUser ? 'bg-blue-50' : ''
    }`}>
      <div className="flex items-center space-x-4">
        {/* Status Indicator */}
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />

        {/* Member Info */}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {item.member.slice(0, 6)}...{item.member.slice(-4)}
            {isCurrentUser && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                You
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            Cycle {item.cycle} • {new Date(item.timestamp).toLocaleDateString()}
          </p>
        </div>

        {/* Reason */}
        {item.reason && (
          <div className="hidden sm:block">
            <p className="text-xs text-gray-600 max-w-xs truncate">
              {item.reason}
            </p>
          </div>
        )}
      </div>

      {/* Penalty Amount */}
      <div className="text-right">
        <p 
          className={`text-sm font-medium ${
            isLate ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {isLate ? `+$${item.penaltyAmount}` : 'No penalty'}
        </p>
        <p className="text-xs text-gray-500">
          {isLate ? 'Late' : 'On time'}
        </p>
      </div>
    </div>
  )
}

interface SummaryStatsProps {
  history: PenaltyHistoryItem[]
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ history }) => {
  const stats = useMemo(() => {
    const total = history.length
    const late = history.filter(item => item.isLate).length
    const onTime = total - late
    const totalPenalties = history
      .filter(item => item.isLate)
      .reduce((sum, item) => sum + item.penaltyAmount, 0)

    return {
      total,
      late,
      onTime,
      totalPenalties,
      latePercentage: total > 0 ? (late / total) * 100 : 0,
      onTimePercentage: total > 0 ? (onTime / total) * 100 : 100,
    }
  }, [history])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        <p className="text-xs text-gray-500">Total Contributions</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
        <p className="text-xs text-gray-500">On Time ({Math.round(stats.onTimePercentage)}%)</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{stats.late}</p>
        <p className="text-xs text-gray-500">Late ({Math.round(stats.latePercentage)}%)</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">${stats.totalPenalties}</p>
        <p className="text-xs text-gray-500">Total Penalties</p>
      </div>
    </div>
  )
}

export const PenaltyHistory: React.FC<PenaltyHistoryProps> = ({
  groupId,
  member,
  showFilters = true,
  showExport = false,
  limit = 50,
  className = ''
}) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: history, isLoading } = usePenaltyHistory(
    groupId, 
    member, 
    { limit }
  )

  const filteredAndSortedHistory = useMemo(() => {
    if (!history) return []

    let filtered = [...history]

    // Apply filter
    if (filter === 'late') {
      filtered = filtered.filter(item => item.isLate)
    } else if (filter === 'on-time') {
      filtered = filtered.filter(item => !item.isLate)
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.member.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sort) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'amount':
          comparison = a.penaltyAmount - b.penaltyAmount
          break
        case 'member':
          comparison = a.member.localeCompare(b.member)
          break
        case 'cycle':
          comparison = a.cycle - b.cycle
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [history, filter, sort, sortDirection, searchQuery])

  const handleExport = () => {
    if (!filteredAndSortedHistory.length) return

    const csv = [
      'Member,Cycle,Date,Status,Penalty Amount,Reason',
      ...filteredAndSortedHistory.map(item => [
        item.member,
        item.cycle,
        new Date(item.timestamp).toLocaleDateString(),
        item.isLate ? 'Late' : 'On Time',
        item.isLate ? `$${item.penaltyAmount}` : '$0',
        item.reason || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `penalty-history-${groupId}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No penalty history found</p>
          <p className="text-sm">
            {member 
              ? 'This member has no penalty records yet.'
              : 'No penalty records found for this group.'
            }
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <SummaryStats history={history} />

      {/* Filters */}
      {showFilters && (
        <FilterBar
          filter={filter}
          sort={sort}
          sortDirection={sortDirection}
          searchQuery={searchQuery}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onSortDirectionChange={setSortDirection}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Export Button */}
      {showExport && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="small"
            onClick={handleExport}
            disabled={!filteredAndSortedHistory.length}
          >
            Export CSV
          </Button>
        </div>
      )}

      {/* History List */}
      <Card className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredAndSortedHistory.length > 0 ? (
            filteredAndSortedHistory.map((item) => (
              <PenaltyHistoryRow
                key={item.id}
                item={item}
                // TODO: Determine if current user
                isCurrentUser={false}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No items match your filters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Showing {filteredAndSortedHistory.length} of {history.length} records
      </div>
    </div>
  )
}
