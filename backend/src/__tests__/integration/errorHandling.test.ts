/**
 * Integration tests for Error Handling
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import request from 'supertest'
import { createApp, generateToken, generateValidPublicKey } from '../../../tests/testHelpers'

jest.mock('../../services/sorobanService')

const app = createApp()

// ---------------------------------------------------------------------------
// Req 9.1 — Non-existent route → 404 + success:false + error field
// ---------------------------------------------------------------------------
describe('Error Handling — 404 for unknown routes (Req 9.1)', () => {
  it('returns 404 with success:false and an error field for an unknown route', async () => {
    // Arrange — route does not exist

    // Act
    const res = await request(app).get('/api/this-route-does-not-exist-at-all')

    // Assert
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body).toHaveProperty('error')
  })
})

// ---------------------------------------------------------------------------
// Req 9.2 — Unhandled error in route handler → 500 + success:false
// ---------------------------------------------------------------------------
describe('Error Handling — 500 for unhandled route errors (Req 9.2)', () => {
  it('returns 500 with success:false when a route handler throws an unhandled error', async () => {
    // Arrange — mock sorobanService.getAllGroups to throw a plain Error
    const { mockGetAllGroups } = jest.requireMock('../../services/sorobanService') as {
      mockGetAllGroups: jest.Mock
    }
    mockGetAllGroups.mockRejectedValueOnce(new Error('Unexpected database failure'))

    // Act
    const res = await request(app).get('/api/groups')

    // Assert
    expect(res.status).toBe(500)
    expect(res.body.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Req 9.3 — Zod validation failure → 400 + success:false + code + details[]
// ---------------------------------------------------------------------------
describe('Error Handling — Zod validation errors (Req 9.3)', () => {
  it('returns 400 with success:false, code VALIDATION_ERROR, and a details array on invalid body', async () => {
    // Arrange — POST /api/goals with a body that fails createGoalSchema
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)

    // Act — missing required fields (title, targetAmount, deadline, category)
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'missing required fields' })

    // Assert
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.code).toBe('VALIDATION_ERROR')
    expect(Array.isArray(res.body.details)).toBe(true)
    expect(res.body.details.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Req 9.4 — Production mode: no stack traces in error responses
// ---------------------------------------------------------------------------
describe('Error Handling — no stack traces in production (Req 9.4)', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('does not include a stack field in error responses when NODE_ENV is production', async () => {
    // Arrange
    process.env.NODE_ENV = 'production'

    // Act
    const res = await request(app).get('/api/this-route-does-not-exist-either')

    // Assert
    expect(res.status).toBe(404)
    expect(res.body).not.toHaveProperty('stack')
  })
})

// ---------------------------------------------------------------------------
// Req 9.5 — NotFoundError thrown by controller → 404 + success:false
// ---------------------------------------------------------------------------
describe('Error Handling — NotFoundError from controller (Req 9.5)', () => {
  it('returns 404 with success:false when a controller throws NotFoundError', async () => {
    // Arrange — mock sorobanService.getGroup to return null so controller throws NotFoundError
    const { mockGetGroup } = jest.requireMock('../../services/sorobanService') as {
      mockGetGroup: jest.Mock
    }
    mockGetGroup.mockResolvedValueOnce(null)

    // Act
    const res = await request(app).get('/api/groups/non-existent-group-id')

    // Assert
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
