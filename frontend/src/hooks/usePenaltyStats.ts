/**
 * Penalty Statistics Hook
 * 
 * Provides penalty data fetching and management for groups and members.
 * Integrates with the smart contract's penalty tracking system.
 */

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { initializeSoroban } from '../services/soroban'
import { cacheService, CacheKeys } from '../services/cache'
import { analytics } from '../services/analytics'
import { MemberPenaltyRecord, PenaltyStats, PenaltyHistoryItem } from '../types'

// Initialize Soroban service
const sorobanService = initializeSoroban()

// Query keys for penalty data
export const PENALTY_QUERY_KEYS = {
  MEMBER_PENALTY_RECORD: (groupId: string, member: string) => 
    ['penalty', 'member', groupId, member] as const,
  GROUP_PENALTY_STATS: (groupId: string) => 
    ['penalty', 'stats', groupId] as const,
  PENALTY_HISTORY: (groupId: string, member?: string) => 
    ['penalty', 'history', groupId, member] as const,
  USER_PENALTY_RECORDS: (userId: string) => 
    ['penalty', 'user', userId] as const,
} as const

// Default query options
const DEFAULT_QUERY_OPTIONS = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 2,
}

/**
 * Fetch penalty record for a specific member in a group
 */
export const useMemberPenaltyRecord = (
  groupId: string,
  member: string,
  options: { useCache?: boolean; bustCache?: boolean } = {}
) => {
  const { useCache = true, bustCache = false } = options
  const queryKey = useMemo(
    () => PENALTY_QUERY_KEYS.MEMBER_PENALTY_RECORD(groupId, member),
    [groupId, member]
  )

  return useQuery({
    queryKey,
    queryFn: async (): Promise<MemberPenaltyRecord> => {
      if (bustCache) {
        cacheService.invalidate(CacheKeys.memberPenaltyRecord(groupId, member))
      }
      
      try {
        return await analytics.measureAsync('query_member_penalty_record', () =>
          sorobanService.getMemberPenaltyRecord(groupId, member, useCache)
        )
      } catch (error) {
        analytics.trackError(error as Error, { 
          operation: 'useMemberPenaltyRecord', 
          groupId, 
          member 
        }, 'medium')
        throw error
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
    enabled: !!groupId && !!member,
  })
}

/**
 * Fetch aggregated penalty statistics for a group
 */
export const useGroupPenaltyStats = (
  groupId: string,
  options: { useCache?: boolean; bustCache?: boolean } = {}
) => {
  const { useCache = true, bustCache = false } = options
  const queryKey = useMemo(
    () => PENALTY_QUERY_KEYS.GROUP_PENALTY_STATS(groupId),
    [groupId]
  )

  return useQuery({
    queryKey,
    queryFn: async (): Promise<PenaltyStats> => {
      if (bustCache) {
        cacheService.invalidate(CacheKeys.groupPenaltyStats(groupId))
      }
      
      try {
        return await analytics.measureAsync('query_group_penalty_stats', () =>
          sorobanService.getGroupPenaltyStats(groupId, useCache)
        )
      } catch (error) {
        analytics.trackError(error as Error, { 
          operation: 'useGroupPenaltyStats', 
          groupId 
        }, 'medium')
        throw error
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
    enabled: !!groupId,
    staleTime: 60 * 1000, // 1 minute for stats
  })
}

/**
 * Fetch penalty history for a group or specific member
 */
export const usePenaltyHistory = (
  groupId: string,
  member?: string,
  options: { 
    useCache?: boolean; 
    bustCache?: boolean; 
    limit?: number 
  } = {}
) => {
  const { useCache = true, bustCache = false, limit = 50 } = options
  const queryKey = useMemo(
    () => PENALTY_QUERY_KEYS.PENALTY_HISTORY(groupId, member),
    [groupId, member]
  )

  return useQuery({
    queryKey,
    queryFn: async (): Promise<PenaltyHistoryItem[]> => {
      if (bustCache) {
        cacheService.invalidate(CacheKeys.penaltyHistory(groupId, member))
      }
      
      try {
        return await analytics.measureAsync('query_penalty_history', () =>
          sorobanService.getPenaltyHistory(groupId, member, limit, useCache)
        )
      } catch (error) {
        analytics.trackError(error as Error, { 
          operation: 'usePenaltyHistory', 
          groupId, 
          member 
        }, 'medium')
        throw error
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000, // 2 minutes for history
  })
}

/**
 * Fetch all penalty records for a user across all groups
 */
export const useUserPenaltyRecords = (
  userId: string,
  options: { useCache?: boolean; bustCache?: boolean } = {}
) => {
  const { useCache = true, bustCache = false } = options
  const queryKey = useMemo(
    () => PENALTY_QUERY_KEYS.USER_PENALTY_RECORDS(userId),
    [userId]
  )

  return useQuery({
    queryKey,
    queryFn: async (): Promise<MemberPenaltyRecord[]> => {
      if (bustCache) {
        cacheService.invalidate(CacheKeys.userPenaltyRecords(userId))
      }
      
      try {
        return await analytics.measureAsync('query_user_penalty_records', () =>
          sorobanService.getUserPenaltyRecords(userId, useCache)
        )
      } catch (error) {
        analytics.trackError(error as Error, { 
          operation: 'useUserPenaltyRecords', 
          userId 
        }, 'medium')
        throw error
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for user-wide data
  })
}

/**
 * Cache invalidation hook for penalty data
 */
export const usePenaltyCacheInvalidation = () => {
  const queryClient = useQueryClient()

  const invalidateMemberPenaltyRecord = useCallback(
    (groupId: string, member: string) => {
      queryClient.invalidateQueries({ 
        queryKey: PENALTY_QUERY_KEYS.MEMBER_PENALTY_RECORD(groupId, member) 
      })
      cacheService.invalidate(CacheKeys.memberPenaltyRecord(groupId, member))
    },
    [queryClient]
  )

  const invalidateGroupPenaltyStats = useCallback(
    (groupId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: PENALTY_QUERY_KEYS.GROUP_PENALTY_STATS(groupId) 
      })
      cacheService.invalidate(CacheKeys.groupPenaltyStats(groupId))
    },
    [queryClient]
  )

  const invalidatePenaltyHistory = useCallback(
    (groupId: string, member?: string) => {
      queryClient.invalidateQueries({ 
        queryKey: PENALTY_QUERY_KEYS.PENALTY_HISTORY(groupId, member) 
      })
      cacheService.invalidate(CacheKeys.penaltyHistory(groupId, member))
    },
    [queryClient]
  )

  const invalidateUserPenaltyRecords = useCallback(
    (userId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: PENALTY_QUERY_KEYS.USER_PENALTY_RECORDS(userId) 
      })
      cacheService.invalidate(CacheKeys.userPenaltyRecords(userId))
    },
    [queryClient]
  )

  const invalidateAllPenaltyData = useCallback(
    (groupId?: string) => {
      if (groupId) {
        queryClient.invalidateQueries({ 
          queryKey: ['penalty', groupId] 
        })
        sorobanService.invalidateGroupPenaltyCache(groupId)
      } else {
        queryClient.invalidateQueries({ 
          queryKey: ['penalty'] 
        })
        sorobanService.invalidateAllPenaltyCache()
      }
    },
    [queryClient]
  )

  return useMemo(
    () => ({
      invalidateMemberPenaltyRecord,
      invalidateGroupPenaltyStats,
      invalidatePenaltyHistory,
      invalidateUserPenaltyRecords,
      invalidateAllPenaltyData,
    }),
    [
      invalidateMemberPenaltyRecord,
      invalidateGroupPenaltyStats,
      invalidatePenaltyHistory,
      invalidateUserPenaltyRecords,
      invalidateAllPenaltyData,
    ]
  )
}

/**
 * Prefetch hook for penalty data
 */
export const usePenaltyPrefetch = () => {
  const queryClient = useQueryClient()

  const prefetchMemberPenaltyRecord = useCallback(
    (groupId: string, member: string) => {
      queryClient.prefetchQuery({
        queryKey: PENALTY_QUERY_KEYS.MEMBER_PENALTY_RECORD(groupId, member),
        queryFn: () => sorobanService.getMemberPenaltyRecord(groupId, member),
        staleTime: 30 * 1000,
      })
    },
    [queryClient]
  )

  const prefetchGroupPenaltyStats = useCallback(
    (groupId: string) => {
      queryClient.prefetchQuery({
        queryKey: PENALTY_QUERY_KEYS.GROUP_PENALTY_STATS(groupId),
        queryFn: () => sorobanService.getGroupPenaltyStats(groupId),
        staleTime: 60 * 1000,
      })
    },
    [queryClient]
  )

  return useMemo(
    () => ({ prefetchMemberPenaltyRecord, prefetchGroupPenaltyStats }),
    [prefetchMemberPenaltyRecord, prefetchGroupPenaltyStats]
  )
}

/**
 * Calculate reliability score color based on score value
 */
export const getReliabilityScoreColor = (score: number): string => {
  if (score >= 90) return '#10b981' // green-500
  if (score >= 75) return '#3b82f6' // blue-500
  if (score >= 60) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

/**
 * Get reliability score label
 */
export const getReliabilityScoreLabel = (score: number): string => {
  if (score >= 95) return 'Excellent'
  if (score >= 85) return 'Very Good'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Poor'
}
