import { Express } from 'express'
import { AuthService } from '../src/services/authService'
import { prisma } from '../src/config/database'
import app from '../src/app'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Generate a JWT for the given Stellar public key using AuthService.
 */
export function generateToken(publicKey: string): string {
  return AuthService.generateToken(publicKey)
}

/**
 * Return a valid-looking Stellar G-address (56 chars, starts with G, base32 chars).
 * Uses the base32 character set: A-Z and 2-7.
 */
export function generateValidPublicKey(): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let key = 'G'
  for (let i = 1; i < 56; i++) {
    key += base32Chars[Math.floor(Math.random() * base32Chars.length)]
  }
  return key
}

/**
 * Build an Authorization header object for use with supertest.
 */
export function buildAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}

// ---------------------------------------------------------------------------
// Database seeders
// ---------------------------------------------------------------------------

let _groupCounter = 0
let _userCounter = 0

type GroupCreateInput = Parameters<typeof prisma.group.create>[0]['data']
type UserCreateInput = Parameters<typeof prisma.user.create>[0]['data']

/**
 * Insert a Group record into the test database and return it.
 */
export async function seedGroup(overrides?: Partial<GroupCreateInput>) {
  _groupCounter++
  const defaults: GroupCreateInput = {
    id: `test-group-${_groupCounter}-${Date.now()}`,
    name: `Test Group ${_groupCounter}`,
    contributionAmount: BigInt(1000),
    frequency: 30,
    maxMembers: 10,
    currentRound: 0,
    isActive: true,
  }
  return prisma.group.create({
    data: { ...defaults, ...overrides },
  })
}

/**
 * Insert a User record into the test database and return it.
 */
export async function seedUser(overrides?: Partial<UserCreateInput>) {
  _userCounter++
  const walletAddress =
    (overrides as { walletAddress?: string } | undefined)?.walletAddress ??
    generateValidPublicKey()
  return prisma.user.create({
    data: {
      walletAddress,
      ...(overrides as object),
    } as UserCreateInput,
  })
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

/**
 * Delete all rows from test tables in dependency order to avoid FK violations.
 */
export async function cleanupDb(): Promise<void> {
  await prisma.proposalSignature.deleteMany()
  await prisma.transactionProposal.deleteMany()
  await prisma.signerConfig.deleteMany()
  await prisma.multiSigConfig.deleteMany()
  await prisma.contribution.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.goalMember.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.group.deleteMany()
  await prisma.fraudFlag.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.referralCode.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.rewardHistory.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.userChallenge.deleteMany()
  await prisma.userFollow.deleteMany()
  await prisma.activityFeed.deleteMany()
  await prisma.leaderboardCache.deleteMany()
  await prisma.userGamification.deleteMany()
  await prisma.userMetrics.deleteMany()
  await prisma.user.deleteMany()
  // Reset counters
  _groupCounter = 0
  _userCounter = 0
}

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

/**
 * Return the Express app instance for use with supertest.
 */
export function createApp(): Express {
  return app
}
