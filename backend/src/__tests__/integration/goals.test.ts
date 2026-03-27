/**
 * Integration tests for Goals API
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */

import request from 'supertest'
import {
  createApp,
  generateToken,
  generateValidPublicKey,
  buildAuthHeader,
} from '../../../tests/testHelpers'

// Mock PrismaClient used inside goalsController
jest.mock('@prisma/client', () => {
  const mockGoalCreate = jest.fn()
  const mockGoalFindMany = jest.fn()
  const mockGoalFindUnique = jest.fn()
  const mockGoalUpdate = jest.fn()
  const mockGoalDelete = jest.fn()

  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    goal: {
      create: mockGoalCreate,
      findMany: mockGoalFindMany,
      findUnique: mockGoalFindUnique,
      update: mockGoalUpdate,
      delete: mockGoalDelete,
    },
  }))

  return { PrismaClient: mockPrismaClient }
})

const app = createApp()

// Helper to get the mock goal methods after jest.mock is set up
function getGoalMocks() {
  const { PrismaClient } = jest.requireMock('@prisma/client') as {
    PrismaClient: jest.Mock
  }
  const instance = PrismaClient.mock.results[0]?.value ?? new PrismaClient()
  return instance.goal as {
    create: jest.Mock
    findMany: jest.Mock
    findUnique: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
}

const futureDeadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

const validGoalBody = () => ({
  title: 'Emergency Fund',
  description: 'Save for emergencies',
  targetAmount: '5000',
  deadline: futureDeadline,
  category: 'EMERGENCY',
  isPublic: false,
})

describe('Goals API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Req 7.1: POST /api/goals with valid token + valid body → HTTP 201 + body with id field
  it('POST /api/goals with valid token and valid body returns 201 with id field', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getGoalMocks()
    const createdGoal = {
      id: 'goal-1',
      userId: publicKey,
      title: 'Emergency Fund',
      description: 'Save for emergencies',
      targetAmount: BigInt(5000),
      currentAmount: BigInt(0),
      deadline: new Date(futureDeadline),
      category: 'EMERGENCY',
      isPublic: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mocks.create.mockResolvedValue(createdGoal)

    // Act
    const res = await request(app)
      .post('/api/goals')
      .set(buildAuthHeader(token))
      .send(validGoalBody())

    // Assert
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('id')
  })

  // Req 7.2: GET /api/goals with valid token → HTTP 200 + body.data array with only own goals
  it('GET /api/goals with valid token returns 200 with data array of own goals', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getGoalMocks()
    const ownGoals = [
      {
        id: 'goal-1',
        userId: publicKey,
        title: 'My Goal',
        targetAmount: BigInt(1000),
        currentAmount: BigInt(0),
        deadline: new Date(futureDeadline),
        category: 'CUSTOM',
        isPublic: false,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mocks.findMany.mockResolvedValue(ownGoals)

    // Act
    const res = await request(app)
      .get('/api/goals')
      .set(buildAuthHeader(token))

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    // Verify the mock was called with the authenticated user's ID
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: publicKey } })
    )
  })

  // Req 7.3: GET /api/goals/:id for own goal → HTTP 200 + goal object
  it('GET /api/goals/:id for own goal returns 200 with goal object', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getGoalMocks()
    const goal = {
      id: 'goal-abc',
      userId: publicKey,
      title: 'Vacation Fund',
      targetAmount: BigInt(3000),
      currentAmount: BigInt(500),
      deadline: new Date(futureDeadline),
      category: 'VACATION',
      isPublic: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [],
    }
    mocks.findUnique.mockResolvedValue(goal)

    // Act
    const res = await request(app)
      .get('/api/goals/goal-abc')
      .set(buildAuthHeader(token))

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.id).toBe('goal-abc')
  })

  // Req 7.4: PATCH /api/goals/:id with valid token + updated fields → HTTP 200 + updated goal
  it('PATCH /api/goals/:id with valid token and updated fields returns 200 with updated goal', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getGoalMocks()
    const updatedGoal = {
      id: 'goal-abc',
      userId: publicKey,
      title: 'Updated Title',
      targetAmount: BigInt(4000),
      currentAmount: BigInt(500),
      deadline: new Date(futureDeadline),
      category: 'VACATION',
      isPublic: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mocks.update.mockResolvedValue(updatedGoal)

    // Act
    const res = await request(app)
      .patch('/api/goals/goal-abc')
      .set(buildAuthHeader(token))
      .send({ title: 'Updated Title', targetAmount: '4000' })

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
  })

  // Req 7.5: DELETE /api/goals/:id with valid token → HTTP 200 + success message
  it('DELETE /api/goals/:id with valid token returns 200 with success message', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const mocks = getGoalMocks()
    mocks.delete.mockResolvedValue({ id: 'goal-abc' })

    // Act
    const res = await request(app)
      .delete('/api/goals/goal-abc')
      .set(buildAuthHeader(token))

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBeDefined()
  })

  // Req 7.6: POST /api/goals/affordability with valid financial inputs → HTTP 200 + required fields
  it('POST /api/goals/affordability with valid inputs returns 200 with financial fields', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const affordabilityBody = {
      monthlyIncome: 5000,
      monthlyExpenses: 2000,
      goalTarget: 10000,
      goalDeadline: futureDeadline,
    }

    // Act
    const res = await request(app)
      .post('/api/goals/affordability')
      .set(buildAuthHeader(token))
      .send(affordabilityBody)

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('status')
    expect(res.body.data).toHaveProperty('requiredMonthlySavings')
    expect(res.body.data).toHaveProperty('disposableIncome')
    expect(res.body.data).toHaveProperty('monthsUntilDeadline')
  })

  // Req 7.7: POST /api/goals/affordability with past deadline → HTTP 400
  it('POST /api/goals/affordability with past deadline returns 400', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const pastDeadline = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const affordabilityBody = {
      monthlyIncome: 5000,
      monthlyExpenses: 2000,
      goalTarget: 10000,
      goalDeadline: pastDeadline,
    }

    // Act
    const res = await request(app)
      .post('/api/goals/affordability')
      .set(buildAuthHeader(token))
      .send(affordabilityBody)

    // Assert
    expect(res.status).toBe(400)
  })

  // Req 7.8: POST /api/goals/projection with valid inputs → HTTP 200 + projection fields
  it('POST /api/goals/projection with valid inputs returns 200 with projection fields', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const projectionBody = {
      principal: 1000,
      monthlyContribution: 200,
      interestRate: 5,
      years: 3,
    }

    // Act
    const res = await request(app)
      .post('/api/goals/projection')
      .set(buildAuthHeader(token))
      .send(projectionBody)

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('totalAmount')
    expect(res.body.data).toHaveProperty('totalContributions')
    expect(res.body.data).toHaveProperty('interestEarned')
  })

  // Req 7.9: POST /api/goals without auth → HTTP 401
  it('POST /api/goals without auth returns 401', async () => {
    // Act
    const res = await request(app)
      .post('/api/goals')
      .send(validGoalBody())

    // Assert
    expect(res.status).toBe(401)
  })
})
