/**
 * E2E test: Full group lifecycle flow
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import request from 'supertest'
import {
  createApp,
  generateToken,
  generateValidPublicKey,
  buildAuthHeader,
  cleanupDb,
} from '../../../tests/testHelpers'

jest.mock('../../services/sorobanService')
jest.setTimeout(60000)

const app = createApp()

describe('E2E: Group Flow', () => {
  beforeAll(async () => {
    await cleanupDb()
  })

  afterAll(async () => {
    await cleanupDb()
  })

  it('full group lifecycle: user A creates group, user B joins, user A contributes', async () => {
    const {
      mockCreateGroup,
      mockJoinGroup,
      mockContribute,
    } = jest.requireMock('../../services/sorobanService') as {
      mockCreateGroup: jest.Mock
      mockJoinGroup: jest.Mock
      mockContribute: jest.Mock
    }

    const publicKeyA = generateValidPublicKey()
    const publicKeyB = generateValidPublicKey()

    const validGroupBody = {
      name: 'E2E Test Group',
      contributionAmount: '100',
      frequency: 'monthly',
      maxMembers: 5,
      currentMembers: 0,
      adminPublicKey: publicKeyA,
      description: 'E2E test group description',
    }

    // -------------------------------------------------------------------------
    // Step 1: User A authenticates — POST /api/auth/token → get tokenA
    // -------------------------------------------------------------------------
    const tokenA = generateToken(publicKeyA)
    expect(tokenA).toBeTruthy()

    // -------------------------------------------------------------------------
    // Step 2: User A creates group phase 1 (no signedXdr) → get unsignedXdr
    // -------------------------------------------------------------------------
    mockCreateGroup.mockResolvedValueOnce({ unsignedXdr: 'UNSIGNED_XDR_PHASE1' })

    const phase1Res = await request(app)
      .post('/api/groups')
      .set(buildAuthHeader(tokenA))
      .send(validGroupBody)

    // Assert phase 1
    expect(phase1Res.status).toBe(200)
    expect(phase1Res.body.success).toBe(true)
    expect(phase1Res.body.data).toHaveProperty('unsignedXdr')

    // -------------------------------------------------------------------------
    // Step 3: User A creates group phase 2 (with signedXdr) → get groupId + txHash
    // -------------------------------------------------------------------------
    const groupId = 'e2e-group-id-001'
    mockCreateGroup.mockResolvedValueOnce({ groupId, txHash: 'e2e-tx-hash-001' })

    const phase2Res = await request(app)
      .post('/api/groups')
      .set(buildAuthHeader(tokenA))
      .send({ ...validGroupBody, signedXdr: 'SIGNED_XDR_PHASE2' })

    // Assert phase 2
    expect(phase2Res.status).toBe(201)
    expect(phase2Res.body.success).toBe(true)
    expect(phase2Res.body.data).toHaveProperty('groupId')
    expect(phase2Res.body.data).toHaveProperty('txHash')

    // -------------------------------------------------------------------------
    // Step 4: User B authenticates — POST /api/auth/token → get tokenB (Req 10.4)
    // -------------------------------------------------------------------------
    const tokenB = generateToken(publicKeyB)
    expect(tokenB).toBeTruthy()
    // Verify user B has a different token from user A
    expect(tokenB).not.toBe(tokenA)

    // -------------------------------------------------------------------------
    // Step 5: User B joins the group — POST /api/groups/:groupId/join → success
    // -------------------------------------------------------------------------
    mockJoinGroup.mockResolvedValueOnce({ success: true, txHash: 'join-tx-hash-001' })

    const joinRes = await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set(buildAuthHeader(tokenB))
      .send({ publicKey: publicKeyB, signedXdr: 'SIGNED_JOIN_XDR' })

    // Assert join
    expect(joinRes.status).toBe(200)
    expect(joinRes.body.success).toBe(true)
    expect(joinRes.body.data).toBeDefined()

    // -------------------------------------------------------------------------
    // Step 6: User A contributes — POST /api/groups/:groupId/contribute → success
    // -------------------------------------------------------------------------
    mockContribute.mockResolvedValueOnce({ success: true, txHash: 'contribute-tx-hash-001' })

    const contributeRes = await request(app)
      .post(`/api/groups/${groupId}/contribute`)
      .set(buildAuthHeader(tokenA))
      .send({ amount: '100', publicKey: publicKeyA, signedXdr: 'SIGNED_CONTRIBUTE_XDR' })

    // Assert contribute
    expect(contributeRes.status).toBe(200)
    expect(contributeRes.body.success).toBe(true)
    expect(contributeRes.body.data).toBeDefined()
  })
})
