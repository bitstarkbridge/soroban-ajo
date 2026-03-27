import dotenv from 'dotenv'
import path from 'path'

// Auto-apply the manual stellar-sdk mock for all tests
jest.mock('stellar-sdk')

// Auto-apply the manual @sendgrid/mail mock for all tests
jest.mock('@sendgrid/mail')

// Load test environment variables for each test file
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

// Set test environment defaults
process.env.NODE_ENV = 'test'
process.env.PORT = '3002'
process.env.SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org'
process.env.SOROBAN_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
process.env.SOROBAN_CONTRACT_ID = 'test-contract-id'

// Per-test-file timeout
jest.setTimeout(30000)

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
