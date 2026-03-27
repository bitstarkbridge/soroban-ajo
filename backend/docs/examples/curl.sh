#!/usr/bin/env bash
# Ajo API — curl examples
# Replace BASE_URL and TOKEN with your values

BASE_URL="http://localhost:3001"
PUBLIC_KEY="GABC1234567890EXAMPLESTELLARWALLETADDRESSXYZ"

# ─── Authentication ───────────────────────────────────────────────────────────

# Get JWT token
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"publicKey\": \"$PUBLIC_KEY\"}" | jq -r '.token')

echo "Token: $TOKEN"

# ─── Groups ───────────────────────────────────────────────────────────────────

# List groups
curl -s "$BASE_URL/api/groups?page=1&limit=10" | jq

# Get group by ID
curl -s "$BASE_URL/api/groups/group_abc123" | jq

# Create group (authenticated)
curl -s -X POST "$BASE_URL/api/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Savers",
    "contributionAmount": 500000000,
    "frequency": 30,
    "maxMembers": 10
  }' | jq

# Join group
curl -s -X POST "$BASE_URL/api/groups/group_abc123/join" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$PUBLIC_KEY\"}" | jq

# Make contribution
curl -s -X POST "$BASE_URL/api/groups/group_abc123/contribute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000000, "txHash": "abc123def456"}' | jq

# ─── Goals ────────────────────────────────────────────────────────────────────

# List goals
curl -s "$BASE_URL/api/goals" \
  -H "Authorization: Bearer $TOKEN" | jq

# Create goal
curl -s -X POST "$BASE_URL/api/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Fund",
    "category": "EMERGENCY",
    "targetAmount": 10000000000,
    "deadline": "2026-12-31T00:00:00.000Z",
    "isPublic": false
  }' | jq

# Check affordability
curl -s -X POST "$BASE_URL/api/goals/affordability" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAmount": 10000000000,
    "deadline": "2026-12-31T00:00:00.000Z",
    "monthlyIncome": 5000000000,
    "monthlyExpenses": 3000000000
  }' | jq

# ─── Gamification ─────────────────────────────────────────────────────────────

# Get stats
curl -s "$BASE_URL/api/gamification/stats" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get leaderboard
curl -s "$BASE_URL/api/gamification/leaderboard?limit=10" | jq

# Track daily login
curl -s -X POST "$BASE_URL/api/gamification/login" \
  -H "Authorization: Bearer $TOKEN" | jq

# Follow a user
curl -s -X POST "$BASE_URL/api/gamification/follow/GXYZ...ABC" \
  -H "Authorization: Bearer $TOKEN" | jq

# ─── Referrals ────────────────────────────────────────────────────────────────

# Generate referral code
curl -s -X POST "$BASE_URL/api/referrals/generate" \
  -H "Authorization: Bearer $TOKEN" | jq

# Validate a code
curl -s -X POST "$BASE_URL/api/referrals/validate" \
  -H "Content-Type: application/json" \
  -d '{"code": "AJO-XYZ123"}' | jq

# Get referral stats
curl -s "$BASE_URL/api/referrals/stats" \
  -H "Authorization: Bearer $TOKEN" | jq

# ─── Disputes ─────────────────────────────────────────────────────────────────

# File a dispute
curl -s -X POST "$BASE_URL/api/disputes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group_abc123",
    "type": "non_payment",
    "summary": "Member has not contributed for 2 cycles",
    "evidence": [{"type": "text", "content": "No payment received since Jan 2026"}]
  }' | jq

# Get dispute
curl -s "$BASE_URL/api/disputes/disp_001" | jq

# Vote on dispute
curl -s -X POST "$BASE_URL/api/disputes/disp_001/vote" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vote": "in_favor"}' | jq

# ─── KYC ──────────────────────────────────────────────────────────────────────

# Check KYC status
curl -s "$BASE_URL/api/kyc/status" \
  -H "Authorization: Bearer $TOKEN" | jq

# Request verification
curl -s -X POST "$BASE_URL/api/kyc/request" \
  -H "Authorization: Bearer $TOKEN" | jq

# Upload document
curl -s -X POST "$BASE_URL/api/kyc/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"docType": "passport", "data": "base64encodeddata..."}' | jq

# ─── Analytics ────────────────────────────────────────────────────────────────

# Track event
curl -s -X POST "$BASE_URL/api/analytics" \
  -H "Content-Type: application/json" \
  -d '{"type": "page_view", "userId": "GABC...XYZ", "eventData": {"page": "/groups"}}' | jq

# Get stats
curl -s "$BASE_URL/api/analytics/stats" | jq

# Create export
curl -s -X POST "$BASE_URL/api/analytics/export" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "dateRange": {"start": "2026-01-01T00:00:00.000Z", "end": "2026-03-31T00:00:00.000Z"},
    "includeMetrics": true
  }' | jq
