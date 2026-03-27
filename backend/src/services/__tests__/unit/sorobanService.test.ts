/**
 * Unit tests for SorobanService — Requirements 4.1–4.8
 */
import { SorobanService, SorobanServiceError } from '../../sorobanService'

jest.mock('stellar-sdk', () => {
  const mockSimulateTransaction = jest.fn()
  const mockSendTransaction = jest.fn()
  const mockGetAccount = jest.fn()
  const mockGetTransaction = jest.fn()
  const mockAssembleTransaction = jest.fn()
  const mockBuild = jest.fn()
  const mockFromXDR = jest.fn()
  const mockServerInstance = {
    simulateTransaction: mockSimulateTransaction,
    sendTransaction: mockSendTransaction,
    getAccount: mockGetAccount,
    getTransaction: mockGetTransaction,
  }
  const MockServer = jest.fn().mockImplementation(() => mockServerInstance)
  // Use Object.assign to attach static methods without TS property errors
  const MockTransactionBuilder = Object.assign(
    jest.fn().mockImplementation(() => ({
      addOperation: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockReturnThis(),
      build: mockBuild,
    })),
    { fromXDR: mockFromXDR }
  )
  const MockContract = jest.fn().mockImplementation(() => ({ call: jest.fn().mockReturnValue({}) }))
  const MockAddress = Object.assign(
    jest.fn().mockImplementation((addr: string) => ({
      toScVal: jest.fn().mockReturnValue({ type: 'address', value: addr }),
      toString: () => addr,
    })),
    { fromScVal: jest.fn() }
  )
  const isSimulationError = jest.fn((result: unknown) => {
    return result !== null && typeof result === 'object' && 'error' in result
  })
  return {
    SorobanRpc: {
      Server: MockServer,
      assembleTransaction: mockAssembleTransaction,
      Api: {
        GetTransactionStatus: { SUCCESS: 'SUCCESS', FAILED: 'FAILED', NOT_FOUND: 'NOT_FOUND' },
        isSimulationError,
      },
    },
    TransactionBuilder: MockTransactionBuilder,
    Contract: MockContract,
    Address: MockAddress,
    nativeToScVal: jest.fn().mockImplementation((val: unknown) => ({ value: val })),
    BASE_FEE: '100',
    Networks: { TESTNET: 'Test SDF Network ; September 2015' },
    __mockServerInstance: mockServerInstance,
    __mockAssembleTransaction: mockAssembleTransaction,
    __mockBuild: mockBuild,
    __mockFromXDR: mockFromXDR,
  }
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const StellarMock = require('stellar-sdk') as {
  __mockServerInstance: {
    simulateTransaction: jest.Mock
    sendTransaction: jest.Mock
    getAccount: jest.Mock
    getTransaction: jest.Mock
  }
  __mockAssembleTransaction: jest.Mock
  __mockBuild: jest.Mock
  __mockFromXDR: jest.Mock
  SorobanRpc: { Api: { isSimulationError: jest.Mock } }
}

// ---------------------------------------------------------------------------
// ScVal builder helpers — minimal mock ScVal objects for the service decoder
// ---------------------------------------------------------------------------

interface MockScVal {
  switch: () => { name: string }
  str: () => { toString: () => string } | null
  sym: () => { toString: () => string } | null
  b: () => boolean
  u32: () => number
  u64: () => { toString: () => string }
  i128: () => { lo: () => { toString: () => string } }
  toXDR: () => string
  map: () => MockScMapEntry[] | null
  vec: () => MockScVal[] | null
}

interface MockScMapEntry {
  key: () => { str: () => { toString: () => string }; sym: () => null }
  val: () => MockScVal
}

function makeScString(value: string): MockScVal {
  return {
    switch: () => ({ name: 'scvString' }),
    str: () => ({ toString: () => value }),
    sym: () => ({ toString: () => value }),
    b: () => false, u32: () => 0,
    u64: () => ({ toString: () => '0' }),
    i128: () => ({ lo: () => ({ toString: () => '0' }) }),
    toXDR: () => '', map: () => null, vec: () => null,
  }
}

function makeScMapEntry(keyStr: string, valScVal: MockScVal): MockScMapEntry {
  return {
    key: () => ({ str: () => ({ toString: () => keyStr }), sym: () => null }),
    val: () => valScVal,
  }
}

function makeScMap(fields: Record<string, MockScVal>): MockScVal {
  const entries = Object.entries(fields).map(([k, v]) => makeScMapEntry(k, v))
  return {
    switch: () => ({ name: 'scvMap' }),
    map: () => entries, vec: () => null, str: () => null, sym: () => null,
    b: () => false, u32: () => 0,
    u64: () => ({ toString: () => '0' }),
    i128: () => ({ lo: () => ({ toString: () => '0' }) }),
    toXDR: () => '',
  }
}

function makeScVec(items: MockScVal[]): MockScVal {
  return {
    switch: () => ({ name: 'scvVec' }),
    vec: () => items, map: () => null, str: () => null, sym: () => null,
    b: () => false, u32: () => 0,
    u64: () => ({ toString: () => '0' }),
    i128: () => ({ lo: () => ({ toString: () => '0' }) }),
    toXDR: () => '',
  }
}

function makeScVoid(): MockScVal {
  return {
    switch: () => ({ name: 'scvVoid' }),
    vec: () => null, map: () => null, str: () => null, sym: () => null,
    b: () => false, u32: () => 0,
    u64: () => ({ toString: () => '0' }),
    i128: () => ({ lo: () => ({ toString: () => '0' }) }),
    toXDR: () => '',
  }
}

function makeGroupScMap(overrides: Record<string, string> = {}): MockScVal {
  const defaults: Record<string, string> = {
    id: 'group-001', name: 'Test Group', description: 'A test group',
    contribution_amount: '10000000', frequency: 'monthly',
    max_members: '10', current_members: '3',
    admin: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    created_at: '1700000000', is_active: 'true',
    ...overrides,
  }
  const fields: Record<string, MockScVal> = {}
  for (const [k, v] of Object.entries(defaults)) fields[k] = makeScString(v)
  return makeScMap(fields)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SorobanService', () => {
  let service: SorobanService
  let mockServer: typeof StellarMock.__mockServerInstance

  beforeEach(() => {
    jest.clearAllMocks()
    StellarMock.SorobanRpc.Api.isSimulationError.mockImplementation(
      (result: unknown) => result !== null && typeof result === 'object' && 'error' in result
    )
    StellarMock.__mockServerInstance.getAccount.mockResolvedValue({
      accountId: () => 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
      sequenceNumber: () => '1000',
      incrementSequenceNumber: jest.fn(),
    })
    StellarMock.__mockBuild.mockReturnValue({ toXDR: () => 'mock-xdr', hash: () => Buffer.from('mock-hash') })
    StellarMock.__mockFromXDR.mockReturnValue({ toXDR: () => 'mock-xdr', hash: () => Buffer.from('mock-hash') })
    StellarMock.__mockAssembleTransaction.mockReturnValue({ build: () => ({ toXDR: () => 'mock-assembled-xdr' }) })
    StellarMock.__mockServerInstance.getTransaction.mockResolvedValue({
      status: 'SUCCESS',
      returnValue: { str: () => ({ toString: () => 'new-group-id' }), sym: () => null },
    })
    StellarMock.__mockServerInstance.sendTransaction.mockResolvedValue({ status: 'PENDING', hash: 'mock-tx-hash' })
    mockServer = StellarMock.__mockServerInstance
    service = new SorobanService()
  })

  // Req 4.1 — getAllGroups returns paginated result
  describe('getAllGroups — basic pagination (Req 4.1)', () => {
    it('returns data array with correct pagination.total and pagination.totalPages', async () => {
      // Arrange
      const groups = [
        makeGroupScMap({ id: 'g1', name: 'Group 1' }),
        makeGroupScMap({ id: 'g2', name: 'Group 2' }),
        makeGroupScMap({ id: 'g3', name: 'Group 3' }),
      ]
      mockServer.simulateTransaction.mockResolvedValue({ result: { retval: makeScVec(groups) } })
      // Act
      const result = await service.getAllGroups({ page: 1, limit: 10 })
      // Assert
      expect(result.data).toHaveLength(3)
      expect(result.pagination.total).toBe(3)
      expect(result.pagination.totalPages).toBe(1)
      expect(result.data[0].id).toBe('g1')
      expect(result.data[2].id).toBe('g3')
    })
  })

  // Req 4.2 — getAllGroups page 2 of 12-item dataset
  describe('getAllGroups — page 2 of 12-item dataset (Req 4.2)', () => {
    it('returns items 6-10 with hasNextPage=true and hasPrevPage=true', async () => {
      // Arrange
      const groups = Array.from({ length: 12 }, (_, i) =>
        makeGroupScMap({ id: `g${i + 1}`, name: `Group ${i + 1}` })
      )
      mockServer.simulateTransaction.mockResolvedValue({ result: { retval: makeScVec(groups) } })
      // Act
      const result = await service.getAllGroups({ page: 2, limit: 5 })
      // Assert
      expect(result.data).toHaveLength(5)
      expect(result.data[0].id).toBe('g6')
      expect(result.data[4].id).toBe('g10')
      expect(result.pagination.hasNextPage).toBe(true)
      expect(result.pagination.hasPrevPage).toBe(true)
      expect(result.pagination.total).toBe(12)
      expect(result.pagination.totalPages).toBe(3)
    })
  })

  // Req 4.3 — getGroup with non-existent ID returns null
  describe('getGroup — non-existent ID (Req 4.3)', () => {
    it('returns null when the mocked RPC returns scvVoid', async () => {
      // Arrange
      mockServer.simulateTransaction.mockResolvedValue({ result: { retval: makeScVoid() } })
      // Act
      const result = await service.getGroup('non-existent-id')
      // Assert
      expect(result).toBeNull()
    })
  })

  // Req 4.4 — createGroup without signedXdr returns unsignedXdr
  describe('createGroup — without signedXdr (Req 4.4)', () => {
    it('returns an object with unsignedXdr and no groupId', async () => {
      // Arrange
      mockServer.simulateTransaction.mockResolvedValue({ result: { retval: null } })
      StellarMock.__mockAssembleTransaction.mockReturnValue({ build: () => ({ toXDR: () => 'unsigned-xdr-string' }) })
      // Act
      const result = await service.createGroup({
        name: 'My Group', description: 'Test', contributionAmount: '10000000',
        frequency: 'monthly', maxMembers: 10,
        adminPublicKey: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
      })
      // Assert
      expect(result.unsignedXdr).toBeDefined()
      expect(typeof result.unsignedXdr).toBe('string')
      expect(result.groupId).toBeUndefined()
    })
  })

  // Req 4.5 — createGroup with signedXdr returns groupId and txHash
  describe('createGroup — with signedXdr (Req 4.5)', () => {
    it('returns groupId and txHash after successful submission', async () => {
      // Arrange
      mockServer.sendTransaction.mockResolvedValue({ status: 'PENDING', hash: 'tx-hash-abc123' })
      mockServer.getTransaction.mockResolvedValue({
        status: 'SUCCESS',
        returnValue: { str: () => ({ toString: () => 'new-group-id' }), sym: () => null },
      })
      StellarMock.__mockFromXDR.mockReturnValue({ toXDR: () => 'signed-xdr', hash: () => Buffer.from('tx-hash-abc123') })
      // Act
      const result = await service.createGroup({
        name: 'My Group', description: 'Test', contributionAmount: '10000000',
        frequency: 'monthly', maxMembers: 10,
        adminPublicKey: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
        signedXdr: 'signed-xdr-base64',
      })
      // Assert
      expect(result.groupId).toBeDefined()
      expect(result.txHash).toBe('tx-hash-abc123')
      expect(result.unsignedXdr).toBeUndefined()
    })
  })

  // Req 4.6 — simulation error throws SorobanServiceError(SIMULATION_ERROR)
  describe('simulation error (Req 4.6)', () => {
    it('throws SorobanServiceError with code SIMULATION_ERROR', async () => {
      // Arrange
      mockServer.simulateTransaction.mockResolvedValue({ error: 'Contract execution failed' })
      // Act & Assert
      await expect(service.getAllGroups({ page: 1, limit: 10 })).rejects.toThrow(SorobanServiceError)
      await expect(service.getAllGroups({ page: 1, limit: 10 })).rejects.toMatchObject({ code: 'SIMULATION_ERROR' })
    })
  })

  // Req 4.7 — submission error throws SorobanServiceError(SUBMISSION_ERROR)
  describe('submission error (Req 4.7)', () => {
    it('throws SorobanServiceError with code SUBMISSION_ERROR when sendTransaction returns ERROR', async () => {
      // Arrange
      mockServer.sendTransaction.mockResolvedValue({ status: 'ERROR', errorResult: { toXDR: () => 'error-xdr' } })
      StellarMock.__mockFromXDR.mockReturnValue({ toXDR: () => 'signed-xdr', hash: () => Buffer.from('tx-hash') })
      const groupData = {
        name: 'My Group', description: 'Test', contributionAmount: '10000000',
        frequency: 'monthly', maxMembers: 10,
        adminPublicKey: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
        signedXdr: 'signed-xdr-base64',
      }
      // Act & Assert
      await expect(service.createGroup(groupData)).rejects.toThrow(SorobanServiceError)
      await expect(service.createGroup(groupData)).rejects.toMatchObject({ code: 'SUBMISSION_ERROR' })
    })
  })

  // Req 4.8 — contribute without signedXdr returns { success: false, unsignedXdr }
  describe('contribute — without signedXdr (Req 4.8)', () => {
    it('returns { success: false, unsignedXdr: <string> }', async () => {
      // Arrange
      mockServer.simulateTransaction.mockResolvedValue({ result: { retval: null } })
      StellarMock.__mockAssembleTransaction.mockReturnValue({ build: () => ({ toXDR: () => 'unsigned-contribute-xdr' }) })
      // Act
      const result = await service.contribute(
        'group-001',
        'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
        '10000000'
      )
      // Assert
      expect(result.success).toBe(false)
      expect(result.unsignedXdr).toBeDefined()
      expect(typeof result.unsignedXdr).toBe('string')
    })
  })
})
