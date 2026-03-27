import { Router } from 'express'
import { z } from 'zod'
import {
  generateReferralCode,
  validateReferralCode,
  getReferralStats,
  claimReferral,
  completeReferral,
  getReferralAnalytics,
  getReferralLeaderboard,
} from '../controllers/referralController'
import { authenticate } from '../middleware/auth'
import { validateRequest } from '../middleware/validateRequest'

const router = Router()

const referralCodeSchema = z.object({
  code: z.string().min(6).max(12),
})

const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

// POST /api/referrals/generate - Generate or retrieve referral code
router.post('/generate', authenticate, generateReferralCode)

// POST /api/referrals/validate - Validate a referral code
router.post('/validate', validateRequest({ body: referralCodeSchema }), validateReferralCode)

// POST /api/referrals/claim - Claim a referral using a code
router.post('/claim', authenticate, validateRequest({ body: referralCodeSchema }), claimReferral)

// POST /api/referrals/complete - Mark current user's referral as completed
router.post('/complete', authenticate, completeReferral)

// GET /api/referrals/stats - Get referral statistics
router.get('/stats', authenticate, getReferralStats)

// GET /api/referrals/analytics - Get referral analytics summary
router.get('/analytics', authenticate, getReferralAnalytics)

// GET /api/referrals/leaderboard - Get referral leaderboard
router.get('/leaderboard', validateRequest({ query: leaderboardQuerySchema }), getReferralLeaderboard)

export default router
