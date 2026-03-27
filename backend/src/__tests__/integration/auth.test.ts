/**
 * Integration tests for Auth API
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import request from 'supertest'
import { createApp, generateToken, generateValidPublicKey } from '../../../tests/testHelpers'

jest.mock('../../services/sorobanService')

const app = createApp()

describe('Auth API — POST /api/auth/token', () => {
  // Req 5.1: valid Stellar public key → HTTP 200 + body.token is a string
  it('returns 200 and a token string for a valid Stellar public key', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()

    // Act
    const res = await request(app).post('/api/auth/token').send({ publicKey })

    // Assert
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
  })

  // Req 5.2: malformed key → HTTP 400 + body.error
  it('returns 400 with an error for a malformed public key', async () => {
    // Arrange
    const publicKey = 'not-a-key'

    // Act
    const res = await request(app).post('/api/auth/token').send({ publicKey })

    // Assert
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  // Req 5.3: empty body → HTTP 400
  it('returns 400 when the request body is empty', async () => {
    // Act
    const res = await request(app).post('/api/auth/token').send({})

    // Assert
    expect(res.status).toBe(400)
  })
})

describe('Auth API — protected endpoint access (POST /api/groups)', () => {
  const validGroupBody = () => ({
    name: 'Test Group',
    contributionAmount: '100',
    frequency: 'monthly',
    maxMembers: 5,
    currentMembers: 0,
    adminPublicKey: generateValidPublicKey(),
    description: 'A test group',
  })

  // Req 5.4: missing Authorization header → HTTP 401
  it('returns 401 when no Authorization header is provided', async () => {
    // Act
    const res = await request(app).post('/api/groups').send(validGroupBody())

    // Assert
    expect(res.status).toBe(401)
  })

  // Req 5.5: invalid Bearer token → HTTP 401
  it('returns 401 when an invalid Bearer token is provided', async () => {
    // Act
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', 'Bearer this.is.not.valid')
      .send(validGroupBody())

    // Assert
    expect(res.status).toBe(401)
  })

  // Req 5.6: valid Bearer token → HTTP 2xx
  it('returns 2xx when a valid Bearer token is provided', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)

    const { mockCreateGroup } = jest.requireMock('../../services/sorobanService') as {
      mockCreateGroup: jest.Mock
    }
    mockCreateGroup.mockResolvedValue({ unsignedXdr: 'AAAA...XDR' })

    // Act
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send(validGroupBody())

    // Assert
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(300)
  })
})
