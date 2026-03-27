import request from 'supertest'
import {
  buildAuthHeader,
  createApp,
  generateToken,
  generateValidPublicKey,
} from '../../../tests/testHelpers'

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    quit: jest.fn(),
  }))
})

jest.mock('../../services/RewardEngine', () => {
  const mockDistributeReferralReward = jest.fn()
  return {
    RewardEngine: jest.fn().mockImplementation(() => ({
      distributeReferralReward: mockDistributeReferralReward,
    })),
  }
})

jest.mock('../../services/FraudDetector', () => {
  const mockCheckReferral = jest.fn().mockResolvedValue({
    flags: [],
    shouldBlock: false,
  })

  return {
    FraudDetector: jest.fn().mockImplementation(() => ({
      checkReferral: mockCheckReferral,
    })),
  }
})

jest.mock('../../services/analyticsService', () => ({
  analyticsService: {
    saveEvent: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@prisma/client', () => {
  const mockClient = {
    referralCode: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    referral: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    reward: {
      count: jest.fn(),
    },
    userGamification: {
      upsert: jest.fn(),
    },
    fraudFlag: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  }

  const PrismaClient = jest.fn(() => mockClient)
  return { PrismaClient }
})

const app = createApp()

function getPrismaMock() {
  const { PrismaClient } = jest.requireMock('@prisma/client') as {
    PrismaClient: jest.Mock
  }

  return PrismaClient.mock.results[0]?.value ?? new PrismaClient()
}

function getRewardEngineMock() {
  const { RewardEngine } = jest.requireMock('../../services/RewardEngine') as {
    RewardEngine: jest.Mock
  }

  return RewardEngine.mock.results[0]?.value as {
    distributeReferralReward: jest.Mock
  }
}

describe('Referral API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/referrals/generate returns the existing or generated referral code for the authenticated user', async () => {
    const prisma = getPrismaMock()
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)

    prisma.referralCode.findUnique.mockResolvedValue({ userId: publicKey, code: 'REFCODE1' })
    prisma.referral.findMany.mockResolvedValue([])
    prisma.reward.count.mockResolvedValue(0)

    const response = await request(app)
      .post('/api/referrals/generate')
      .set(buildAuthHeader(token))

    expect(response.status).toBe(200)
    expect(response.body.code).toBe('REFCODE1')
    expect(response.body.shareUrl).toContain('REFCODE1')
  })

  it('POST /api/referrals/claim creates a referral for the authenticated referee', async () => {
    const prisma = getPrismaMock()
    const refereeId = generateValidPublicKey()
    const referrerId = generateValidPublicKey()
    const token = generateToken(refereeId)

    prisma.referralCode.findUnique
      .mockResolvedValueOnce({ code: 'REFCODE1', userId: referrerId })
      .mockResolvedValueOnce({ code: 'REFCODE1', userId: referrerId })
    prisma.referral.findUnique.mockResolvedValue(null)
    prisma.referral.create.mockResolvedValue({
      id: 'ref-1',
      referrerId,
      refereeId,
      referralCode: 'REFCODE1',
      status: 'PENDING',
      createdAt: new Date(),
      completedAt: null,
    })
    prisma.userGamification.upsert.mockResolvedValue({})

    const response = await request(app)
      .post('/api/referrals/claim')
      .set(buildAuthHeader(token))
      .send({ code: 'REFCODE1' })

    expect(response.status).toBe(201)
    expect(response.body.referral.refereeId).toBe(refereeId)
    expect(prisma.userGamification.upsert).toHaveBeenCalled()
  })

  it('POST /api/referrals/complete marks the referral as completed and distributes rewards', async () => {
    const prisma = getPrismaMock()
    const refereeId = generateValidPublicKey()
    const referrerId = generateValidPublicKey()
    const token = generateToken(refereeId)
    const rewardEngine = getRewardEngineMock()

    prisma.referral.findUnique.mockResolvedValue({
      id: 'ref-1',
      referrerId,
      refereeId,
      referralCode: 'REFCODE1',
      status: 'PENDING',
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      completedAt: null,
    })
    prisma.referral.update.mockResolvedValue({
      id: 'ref-1',
      referrerId,
      refereeId,
      referralCode: 'REFCODE1',
      status: 'COMPLETED',
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      completedAt: new Date('2026-03-26T00:00:00.000Z'),
    })

    const response = await request(app)
      .post('/api/referrals/complete')
      .set(buildAuthHeader(token))

    expect(response.status).toBe(200)
    expect(response.body.referral.status).toBe('COMPLETED')
    expect(rewardEngine.distributeReferralReward).toHaveBeenCalledWith(referrerId, refereeId)
  })

  it('GET /api/referrals/stats returns referral performance metrics for the authenticated user', async () => {
    const prisma = getPrismaMock()
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)

    prisma.referralCode.findUnique.mockResolvedValue({ userId: publicKey, code: 'REFCODE1' })
    prisma.referral.findMany.mockResolvedValue([
      {
        id: 'ref-1',
        refereeId: generateValidPublicKey(),
        referralCode: 'REFCODE1',
        status: 'COMPLETED',
        createdAt: new Date('2026-03-20T00:00:00.000Z'),
        completedAt: new Date('2026-03-22T00:00:00.000Z'),
      },
      {
        id: 'ref-2',
        refereeId: generateValidPublicKey(),
        referralCode: 'REFCODE1',
        status: 'PENDING',
        createdAt: new Date('2026-03-23T00:00:00.000Z'),
        completedAt: null,
      },
    ])
    prisma.reward.count.mockResolvedValue(3)

    const response = await request(app)
      .get('/api/referrals/stats')
      .set(buildAuthHeader(token))

    expect(response.status).toBe(200)
    expect(response.body.totalReferrals).toBe(2)
    expect(response.body.completedReferrals).toBe(1)
    expect(response.body.totalRewardsEarned).toBe(3)
  })
})
