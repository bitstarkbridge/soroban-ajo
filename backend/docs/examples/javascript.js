/**
 * Ajo API — JavaScript (fetch) examples
 */

const BASE_URL = 'http://localhost:3001'

// ─── Auth client helper ───────────────────────────────────────────────────────

class AjoClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl
    this.token = null
  }

  async authenticate(publicKey) {
    const res = await fetch(`${this.baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey }),
    })
    const data = await res.json()
    this.token = data.token
    return data.token
  }

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers })

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '60') * 1000
      await new Promise(r => setTimeout(r, retryAfter))
      return this.request(path, options) // retry once
    }

    if (!res.ok) {
      const err = await res.json()
      throw Object.assign(new Error(err.error), { code: err.code, status: res.status })
    }

    return res.json()
  }

  get(path, params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(qs ? `${path}?${qs}` : path)
  }

  post(path, body) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) })
  }

  patch(path, body) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(body) })
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' })
  }
}

// ─── Usage examples ───────────────────────────────────────────────────────────

async function main() {
  const client = new AjoClient()

  // Authenticate
  await client.authenticate('GABC...XYZ')

  // ── Groups ──────────────────────────────────────────────────────────────────

  // List groups
  const { groups } = await client.get('/api/groups', { page: 1, limit: 10 })
  console.log('Groups:', groups)

  // Create group
  const { group } = await client.post('/api/groups', {
    name: 'Monthly Savers',
    contributionAmount: 500000000,
    frequency: 30,
    maxMembers: 10,
  })
  console.log('Created group:', group.id)

  // Join group
  await client.post(`/api/groups/${group.id}/join`, { walletAddress: 'GABC...XYZ' })

  // Contribute
  await client.post(`/api/groups/${group.id}/contribute`, {
    amount: 500000000,
    txHash: 'abc123...',
  })

  // ── Goals ───────────────────────────────────────────────────────────────────

  // Create goal
  const { goal } = await client.post('/api/goals', {
    title: 'Emergency Fund',
    category: 'EMERGENCY',
    targetAmount: 10000000000,
    deadline: '2026-12-31T00:00:00.000Z',
    isPublic: false,
  })
  console.log('Created goal:', goal.id)

  // Check affordability
  const affordability = await client.post('/api/goals/affordability', {
    targetAmount: 10000000000,
    deadline: '2026-12-31T00:00:00.000Z',
    monthlyIncome: 5000000000,
    monthlyExpenses: 3000000000,
  })
  console.log('Affordable:', affordability.affordable)

  // ── Gamification ────────────────────────────────────────────────────────────

  const stats = await client.get('/api/gamification/stats')
  console.log('Level:', stats.data.level, '| Points:', stats.data.points)

  const { data: leaderboard } = await client.get('/api/gamification/leaderboard', { limit: 10 })
  console.log('Top user:', leaderboard[0])

  await client.post('/api/gamification/login')

  // ── Referrals ───────────────────────────────────────────────────────────────

  const { code } = await client.post('/api/referrals/generate')
  console.log('Referral code:', code)

  const { valid } = await client.post('/api/referrals/validate', { code: 'AJO-XYZ123' })
  console.log('Code valid:', valid)

  // ── Disputes ────────────────────────────────────────────────────────────────

  const { dispute } = await client.post('/api/disputes', {
    groupId: group.id,
    type: 'non_payment',
    summary: 'Member has not contributed for 2 cycles',
    evidence: [{ type: 'text', content: 'No payment since Jan 2026' }],
  })
  console.log('Dispute filed:', dispute.id)

  await client.post(`/api/disputes/${dispute.id}/vote`, { vote: 'in_favor' })

  // ── KYC ─────────────────────────────────────────────────────────────────────

  const { status } = await client.get('/api/kyc/status')
  console.log('KYC level:', status.level)

  // ── Analytics ───────────────────────────────────────────────────────────────

  await client.post('/api/analytics', {
    type: 'group_joined',
    userId: 'GABC...XYZ',
    groupId: group.id,
  })

  const { exportId } = await client.post('/api/analytics/export', {
    format: 'csv',
    dateRange: { start: '2026-01-01T00:00:00.000Z', end: '2026-03-31T00:00:00.000Z' },
    includeMetrics: true,
  })
  console.log('Export job:', exportId)
}

main().catch(console.error)
