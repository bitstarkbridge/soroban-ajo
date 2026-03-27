import jwt from 'jsonwebtoken'
import { AuthService } from '../../authService'

const JWT_SECRET = 'test-jwt-secret-for-testing-only'

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET
})

const VALID_PUBLIC_KEY = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN'

describe('AuthService', () => {
  // Req 3.1 — generateToken returns a non-empty JWT string
  describe('generateToken', () => {
    it('returns a non-empty string with JWT structure (two dots) for a valid Stellar public key', () => {
      // Arrange
      const publicKey = VALID_PUBLIC_KEY

      // Act
      const token = AuthService.generateToken(publicKey)

      // Assert
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
      const parts = token.split('.')
      expect(parts).toHaveLength(3)
    })
  })

  // Req 3.3 — tampered token throws
  describe('verifyToken — tampered token', () => {
    it('throws when the payload segment has been tampered with', () => {
      // Arrange
      const token = AuthService.generateToken(VALID_PUBLIC_KEY)
      const [header, payload, signature] = token.split('.')
      // Flip the last character of the payload to tamper it
      const tamperedPayload =
        payload.slice(0, -1) + (payload.slice(-1) === 'A' ? 'B' : 'A')
      const tamperedToken = [header, tamperedPayload, signature].join('.')

      // Act & Assert
      expect(() => AuthService.verifyToken(tamperedToken)).toThrow()
    })
  })

  // Req 3.4 — expired token throws
  describe('verifyToken — expired token', () => {
    it('throws when the token has already expired', () => {
      // Arrange — sign a token that expired immediately
      const expiredToken = jwt.sign(
        { publicKey: VALID_PUBLIC_KEY },
        JWT_SECRET,
        { expiresIn: 0 },
      )

      // Act & Assert
      expect(() => AuthService.verifyToken(expiredToken)).toThrow()
    })
  })

  // Req 3.5 — idempotent verification
  describe('verifyToken — idempotent', () => {
    it('returns an equivalent payload on every call for the same valid token', () => {
      // Arrange
      const token = AuthService.generateToken(VALID_PUBLIC_KEY)

      // Act
      const first = AuthService.verifyToken(token)
      const second = AuthService.verifyToken(token)
      const third = AuthService.verifyToken(token)

      // Assert — all calls return the same publicKey, iat, and exp
      expect(second.publicKey).toBe(first.publicKey)
      expect(second.iat).toBe(first.iat)
      expect(second.exp).toBe(first.exp)

      expect(third.publicKey).toBe(first.publicKey)
      expect(third.iat).toBe(first.iat)
      expect(third.exp).toBe(first.exp)
    })
  })
})
