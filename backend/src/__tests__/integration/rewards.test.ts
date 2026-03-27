/**
 * Integration tests for Rewards API
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import request from 'supertest'
import {
  createApp,
  generateToken,
  generateValidPublicKey,
  buildAuthHeader,
} from '../../../tests/testHelpers'

// Mock ioredis to avoid real Redis connections
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  }))
})

// Mock RewardEngine to avoid real service logic
jest.mock('../../services/RewardEngine', () => {
  const mockRedeemReward = jest.fn()
  return {
    RewardEngine: jest.fn().mockImplementation(() => ({
      redeemReward: mockRedeemReward,
    })),
  }
})

// Mock FraudDetector dependency
jest.mock('../../services/FraudDetector', () => {
  return {
    FraudDetector: jest.fn().mockImplementation(() => ({})),
  }
})

// Mock PrismaClient used inside rewardController
jest.mock('@prisma/client', () => {
  const mockRewardFindMany = jest.fn()
  const mockRewardFindUnique = jest.fn()

  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    reward: {
      findMany: mockRewardFindMany,
      findUnique: mockRewardFindUnique,
    },
  }))

  return { PrismaClient: mockPrismaClient }
})

const app = createApp()

function getRewardMocks() {
  const { PrismaClient } = jest.requireMock('@prisma/client') as {
    PrismaClient: jest.Mock
  }
  const instance = PrismaClient.mock.results[0]?.value ?? new PrismaClient()
  return instance.reward as {
    findMany: jest.Mock
    findUnique: jest.Mock
  }
}

function getRewardEngineMock() {
  const { RewardEngine } = jest.requireMock('../../services/RewardEngine') as {
    RewardEngine: jest.Mock
  }
  const instance = RewardEngine.mock.results[0]?.value
  return instance as { redeemReward: jest.Mock }
}

const makeReward = (userId: string, overrides?: object) => ({
  id: 'reward-1',
  userId,
  type: 'FEE_DISCOUNT',
  status: 'ACTIVE',
  source: 'REFERRAL',
  sourceId: null,
  discountPercent: 10,
  tokenAmount: null,
  featureId: null,
  nftMetadata: null,
  expiresAt: null,
  redeemedAt: null,
  earnedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('Rewards API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Req 8.1: GET /api/rewards with valid token → HTTP 200 + body.data array
  it('GET /api/rewards with valid token returns 200 with rewards array', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getRewardMocks()
    mocks.findMany.mockResolvedValue([makeReward(publicKey)])

    // Act
    const res = await request(app)
      .get('/api/rewards')
      .set(buildAuthHeader(token))

    // Assert
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('rewards')
    expect(Array.isArray(res.body.rewards)).toBe(true)
  })

  // Req 8.2: POST /api/rewards/:id/redeem with valid token → HTTP 200 + reward status
  it('POST /api/rewards/:id/redeem with valid token returns 200 with reward status', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getRewardMocks()
    const reward = makeReward(publicKey)
    mocks.findUnique
      .mockResolvedValueOnce(reward)   // ownership check
      .mockResolvedValueOnce({ ...reward, status: 'REDEEMED', redeemedAt: new Date() }) // after redeem

    const engineMock = getRewardEngineMock()
    engineMock.redeemReward.mockResolvedValue(undefined)

    // Act
    const res = await request(app)
      .post('/api/rewards/reward-1/redeem')
      .set(buildAuthHeader(token))

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body).toHaveProperty('reward')
    expect(res.body.reward).toHaveProperty('status')
  })

  // Req 8.3: GET /api/rewards/history with valid token → HTTP 200 + body.data array
  it('GET /api/rewards/history with valid token returns 200 with history array', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getRewardMocks()
    mocks.findMany.mockResolvedValue([
      makeReward(publicKey),
      makeReward(publicKey, { status: 'REDEEMED', redeemedAt: new Date() }),
    ])

    // Act
    const res = await request(app)
      .get('/api/rewards/history')
      .set(buildAuthHeader(token))

    // Assert
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('history')
    expect(Array.isArray(res.body.history)).toBe(true)
    expect(res.body).toHaveProperty('totalEarned')
    expect(res.body).toHaveProperty('totalRedeemed')
  })

  // Req 8.4: Any rewards endpoint without auth → HTTP 401
  it('GET /api/rewards without auth returns 401', async () => {
    // Act
    const res = await request(app).get('/api/rewards')

    // Assert
    expect(res.status).toBe(401)
  })

  it('POST /api/rewards/:id/redeem without auth returns 401', async () => {
    // Act
    const res = await request(app).post('/api/rewards/reward-1/redeem')

    // Assert
    expect(res.status).toBe(401)
  })

  it('GET /api/rewards/history without auth returns 401', async () => {
    // Act
    const res = await request(app).get('/api/rewards/history')

    // Assert
    expect(res.status).toBe(401)
  })
})
