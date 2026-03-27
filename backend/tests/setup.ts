import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'

// Runs once before all test suites (Jest globalSetup)
export default async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

  // Ensure DATABASE_URL is set for migrations
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in .env.test — cannot run migrations')
  }

  // Apply all pending Prisma migrations to the test database
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  })
}

// Runs once after all test suites (Jest globalTeardown)
export async function globalTeardown() {
  const { prisma } = await import('../src/config/database')
  await prisma.$disconnect()
}
