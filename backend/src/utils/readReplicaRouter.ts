import { Pool, QueryResult } from 'pg'
import { readReplicaPools } from '../config/database'

export class ReadReplicaRouter {
  private replicaIndex = 0

  /**
   * Get next read replica pool using round-robin
   */
  private getNextReplica(): Pool | null {
    if (readReplicaPools.length === 0) return null
    const replica = readReplicaPools[this.replicaIndex % readReplicaPools.length]
    this.replicaIndex++
    return replica
  }

  /**
   * Execute read query on replica with fallback to primary
   */
  async executeRead<T = any>(
    query: string,
    values?: any[],
    primaryPool?: Pool,
  ): Promise<QueryResult<T>> {
    const replica = this.getNextReplica()

    if (!replica) {
      if (!primaryPool) throw new Error('No read replicas or primary pool available')
      return primaryPool.query<T>(query, values)
    }

    try {
      return await replica.query<T>(query, values)
    } catch (error) {
      console.warn('Read replica failed, falling back to primary', error)
      if (!primaryPool) throw error
      return primaryPool.query<T>(query, values)
    }
  }

  /**
   * Check replica health
   */
  async checkReplicaHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}

    for (let i = 0; i < readReplicaPools.length; i++) {
      try {
        await readReplicaPools[i].query('SELECT 1')
        health[`replica_${i}`] = true
      } catch {
        health[`replica_${i}`] = false
      }
    }

    return health
  }

  /**
   * Get replica count
   */
  getReplicaCount(): number {
    return readReplicaPools.length
  }
}

export const readReplicaRouter = new ReadReplicaRouter()
