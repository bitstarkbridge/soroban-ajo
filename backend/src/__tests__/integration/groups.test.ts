/**
 * Integration tests for Groups API
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10
 */

import request from 'supertest'
import {
  createApp,
  generateToken,
  generateValidPublicKey,
  buildAuthHeader,
} from '../../../tests/testHelpers'

jest.mock('../../services/sorobanService')

const app = createApp()

const validGroupBody = () => ({
  name: 'Test Group',
  contributionAmount: '100',
  frequency: 'monthly',
  maxMembers: 5,
  currentMembers: 0,
  adminPublicKey: generateValidPublicKey(),
  description: 'A test group',
})

describe('Groups API', () => {
  // Req 6.1: GET /api/groups → HTTP 200 + body.success=true + body.data array + body.pagination object
  it('GET /api/groups returns 200 with success, data array, and pagination', async () => {
    // Arrange
    const { mockGetAllGroups } = jest.requireMock('../../services/sorobanService') as {
      mockGetAllGroups: jest.Mock
    }
    mockGetAllGroups.mockResolvedValue({
      data: [{ id: 'group-1', name: 'Group One' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })

    // Act
    const res = await request(app).get('/api/groups')

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.pagination).toBeDefined()
  })

  // Req 6.2: GET /api/groups/:id with valid group ID → HTTP 200 + body.success=true + group object
  it('GET /api/groups/:id returns 200 with group object for a valid ID', async () => {
    // Arrange
    const { mockGetGroup } = jest.requireMock('../../services/sorobanService') as {
      mockGetGroup: jest.Mock
    }
    mockGetGroup.mockResolvedValue({ id: 'group-1', name: 'Group One' })

    // Act
    const res = await request(app).get('/api/groups/group-1')

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
  })

  // Req 6.3: GET /api/groups/:id with non-existent ID → HTTP 404
  it('GET /api/groups/:id returns 404 for a non-existent group', async () => {
    // Arrange
    const { mockGetGroup } = jest.requireMock('../../services/sorobanService') as {
      mockGetGroup: jest.Mock
    }
    mockGetGroup.mockResolvedValue(null)

    // Act
    const res = await request(app).get('/api/groups/nonexistent-id')

    // Assert
    expect(res.status).toBe(404)
  })

  // Req 6.4: POST /api/groups without auth → HTTP 401
  it('POST /api/groups without auth returns 401', async () => {
    // Act
    const res = await request(app).post('/api/groups').send(validGroupBody())

    // Assert
    expect(res.status).toBe(401)
  })

  // Req 6.5: POST /api/groups with valid token, no signedXdr → HTTP 200 + body.unsignedXdr
  it('POST /api/groups with valid token and no signedXdr returns 200 with unsignedXdr', async () => {
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
      .set(buildAuthHeader(token))
      .send(validGroupBody())

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('unsignedXdr')
  })

  // Req 6.6: POST /api/groups with valid token + signedXdr → HTTP 201 + body.groupId + body.txHash
  it('POST /api/groups with valid token and signedXdr returns 201 with groupId and txHash', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const { mockCreateGroup } = jest.requireMock('../../services/sorobanService') as {
      mockCreateGroup: jest.Mock
    }
    mockCreateGroup.mockResolvedValue({ groupId: 'new-group-id', txHash: 'abc123hash' })

    // Act
    const res = await request(app)
      .post('/api/groups')
      .set(buildAuthHeader(token))
      .send({ ...validGroupBody(), signedXdr: 'SIGNED...XDR' })

    // Assert
    expect(res.status).toBe(201)
    expect(res.body.data).toHaveProperty('groupId')
    expect(res.body.data).toHaveProperty('txHash')
  })

  // Req 6.7: POST /api/groups/:id/join without auth → HTTP 401
  it('POST /api/groups/:id/join without auth returns 401', async () => {
    // Act
    const res = await request(app)
      .post('/api/groups/group-1/join')
      .send({ publicKey: generateValidPublicKey() })

    // Assert
    expect(res.status).toBe(401)
  })

  // Req 6.8: GET /api/groups/:id/members → HTTP 200 + body.data array
  it('GET /api/groups/:id/members returns 200 with data array', async () => {
    // Arrange
    const { mockGetGroupMembers } = jest.requireMock('../../services/sorobanService') as {
      mockGetGroupMembers: jest.Mock
    }
    mockGetGroupMembers.mockResolvedValue([{ publicKey: generateValidPublicKey() }])

    // Act
    const res = await request(app).get('/api/groups/group-1/members')

    // Assert
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  // Req 6.9: GET /api/groups/:id/transactions?page=1&limit=5 → HTTP 200 + body.pagination with page and limit
  it('GET /api/groups/:id/transactions returns 200 with pagination reflecting page and limit', async () => {
    // Arrange
    const { mockGetGroupTransactions } = jest.requireMock('../../services/sorobanService') as {
      mockGetGroupTransactions: jest.Mock
    }
    mockGetGroupTransactions.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 5, total: 0, totalPages: 0 },
    })

    // Act
    const res = await request(app).get('/api/groups/group-1/transactions?page=1&limit=5')

    // Assert
    expect(res.status).toBe(200)
    expect(res.body.pagination).toBeDefined()
    expect(res.body.pagination).toHaveProperty('page')
    expect(res.body.pagination).toHaveProperty('limit')
  })

  // Req 6.10: POST /api/groups with missing required field → HTTP 400
  it('POST /api/groups with missing required field returns 400', async () => {
    // Arrange
    const publicKey = generateValidPublicKey()
    const token = generateToken(publicKey)
    const { name: _name, ...bodyWithoutName } = validGroupBody()

    // Act
    const res = await request(app)
      .post('/api/groups')
      .set(buildAuthHeader(token))
      .send(bodyWithoutName)

    // Assert
    expect(res.status).toBe(400)
  })
})
