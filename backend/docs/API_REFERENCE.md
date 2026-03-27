# Ajo API Reference

Base URL: `http://localhost:3001`  
All endpoints are prefixed with `/api` unless noted otherwise.

---

## Table of Contents

- [Authentication](#authentication)
- [Health](#health)
- [Groups](#groups)
- [Goals](#goals)
- [Gamification](#gamification)
- [Challenges](#challenges)
- [Referrals](#referrals)
- [Rewards](#rewards)
- [Disputes](#disputes)
- [KYC](#kyc)
- [Analytics](#analytics)
- [Webhooks](#webhooks)
- [Admin](#admin)

---

## Authentication

See [AUTHENTICATION.md](./AUTHENTICATION.md) for the full auth flow.

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

---

## Health

### GET /health

Check server status. No authentication required.

**Response 200**
```json
{
  "status": "ok",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "uptime": 3600
}
```

---

## Groups

### GET /api/groups

List all groups (paginated).

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (1-indexed) |
| limit | integer | 20 | Items per page (max 100) |

**Response 200**
```json
{
  "groups": [
    {
      "id": "group_abc123",
      "name": "Monthly Savers",
      "contributionAmount": "500000000",
      "frequency": 30,
      "maxMembers": 10,
      "currentRound": 2,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

---

### GET /api/groups/:id

Get a single group by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Group ID |

**Response 200**
```json
{
  "id": "group_abc123",
  "name": "Monthly Savers",
  "contributionAmount": "500000000",
  "frequency": 30,
  "maxMembers": 10,
  "currentRound": 2,
  "isActive": true,
  "members": [],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Errors:** `404` Group not found

---

### POST /api/groups

Create a new savings group. Requires authentication.

**Request Body**
```json
{
  "name": "Monthly Savers",
  "contributionAmount": 500000000,
  "frequency": 30,
  "maxMembers": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Group name |
| contributionAmount | integer | yes | Amount in stroops (1 XLM = 10,000,000 stroops) |
| frequency | integer | yes | Cycle length in days |
| maxMembers | integer | yes | Maximum number of members |

**Response 201**
```json
{
  "success": true,
  "group": {
    "id": "group_abc123",
    "name": "Monthly Savers",
    "contributionAmount": "500000000",
    "frequency": 30,
    "maxMembers": 10,
    "currentRound": 0,
    "isActive": true
  }
}
```

**Errors:** `400` Validation error, `401` Unauthorized

---

### POST /api/groups/:id/join

Join an existing group. Requires authentication.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Group ID |

**Request Body**
```json
{
  "walletAddress": "GABC...XYZ"
}
```

**Response 200**
```json
{ "success": true, "message": "Joined group successfully" }
```

**Errors:** `400` Already a member or group full, `401` Unauthorized, `404` Group not found

---

### POST /api/groups/:id/contribute

Make a contribution to a group. Requires authentication.

**Request Body**
```json
{
  "amount": 500000000,
  "txHash": "abc123..."
}
```

**Response 200**
```json
{
  "success": true,
  "contribution": {
    "id": "contrib_xyz",
    "groupId": "group_abc123",
    "amount": "500000000",
    "createdAt": "2026-03-26T10:00:00.000Z"
  }
}
```

**Errors:** `400` Invalid amount, `401` Unauthorized, `404` Group not found

---

### GET /api/groups/:id/members

Get all members of a group.

**Response 200**
```json
{
  "members": [
    {
      "userId": "GABC...XYZ",
      "joinedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/groups/:id/transactions

Get paginated transaction history for a group.

**Query Parameters:** `page`, `limit`

**Response 200**
```json
{
  "transactions": [
    {
      "id": "tx_001",
      "type": "contribution",
      "amount": "500000000",
      "userId": "GABC...XYZ",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "total": 20,
  "page": 1
}
```

---

## Goals

All goals endpoints require authentication.

### GET /api/goals

List all goals for the authenticated user.

**Response 200**
```json
{
  "goals": [
    {
      "id": "goal_001",
      "title": "Emergency Fund",
      "category": "EMERGENCY",
      "targetAmount": "10000000000",
      "currentAmount": "2500000000",
      "deadline": "2026-12-31T00:00:00.000Z",
      "isPublic": false,
      "status": "ACTIVE"
    }
  ]
}
```

---

### POST /api/goals

Create a new savings goal.

**Request Body**
```json
{
  "title": "Emergency Fund",
  "description": "6 months of expenses",
  "targetAmount": 10000000000,
  "deadline": "2026-12-31T00:00:00.000Z",
  "category": "EMERGENCY",
  "isPublic": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | yes | Goal name |
| description | string | no | Optional description |
| targetAmount | integer | yes | Target in stroops |
| deadline | ISO 8601 date | yes | Target completion date |
| category | string | yes | EMERGENCY, VACATION, EDUCATION, HOME, RETIREMENT, CUSTOM |
| isPublic | boolean | no | Default false |

**Response 201**
```json
{
  "goal": {
    "id": "goal_001",
    "title": "Emergency Fund",
    "status": "ACTIVE"
  }
}
```

---

### GET /api/goals/:id

Get a single goal by ID.

**Response 200** — Goal object (same shape as list item)

**Errors:** `404` Goal not found

---

### PATCH /api/goals/:id

Update a goal.

**Request Body** — Any subset of goal fields (title, description, targetAmount, deadline, isPublic)

**Response 200** — Updated goal object

---

### DELETE /api/goals/:id

Delete a goal.

**Response 200**
```json
{ "success": true }
```

---

### POST /api/goals/affordability

Check if a goal is affordable given income and expenses.

**Request Body**
```json
{
  "targetAmount": 10000000000,
  "deadline": "2026-12-31T00:00:00.000Z",
  "monthlyIncome": 5000000000,
  "monthlyExpenses": 3000000000
}
```

**Response 200**
```json
{
  "affordable": true,
  "requiredMonthlySaving": 833333333,
  "availableMonthlySaving": 2000000000,
  "surplus": 1166666667
}
```

---

### POST /api/goals/projection

Calculate savings projection scenarios.

**Request Body**
```json
{
  "targetAmount": 10000000000,
  "currentAmount": 1000000000,
  "monthlyContribution": 500000000
}
```

**Response 200**
```json
{
  "projectedCompletionDate": "2027-06-01T00:00:00.000Z",
  "monthsRequired": 18,
  "scenarios": [
    { "monthlyAmount": 500000000, "completionDate": "2027-06-01T00:00:00.000Z" },
    { "monthlyAmount": 1000000000, "completionDate": "2026-12-01T00:00:00.000Z" }
  ]
}
```

---

## Gamification

### GET /api/gamification/stats

Get gamification stats for the authenticated user. Requires authentication.

**Response 200**
```json
{
  "success": true,
  "data": {
    "points": 1250,
    "level": "SILVER",
    "loginStreak": 7,
    "contributionStreak": 3,
    "totalAchievements": 5,
    "rank": 42
  }
}
```

---

### GET /api/gamification/leaderboard

Get the global leaderboard. No authentication required.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 100 | Number of entries |
| offset | integer | 0 | Pagination offset |

**Response 200**
```json
{
  "success": true,
  "data": [
    { "rank": 1, "walletAddress": "GABC...XYZ", "points": 9800, "level": "PLATINUM" }
  ]
}
```

---

### GET /api/gamification/activity

Get the activity feed for the authenticated user. Requires authentication.

**Query Parameters:** `limit` (default 50), `offset` (default 0)

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "act_001",
      "type": "contribution",
      "description": "Made a contribution to Monthly Savers",
      "points": 50,
      "createdAt": "2026-03-26T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/gamification/login

Track a daily login for streak and points. Requires authentication.

**Response 200**
```json
{
  "success": true,
  "data": { "points": 10, "streak": 8 }
}
```

---

### POST /api/gamification/follow/:walletAddress

Follow another user. Requires authentication.

**Path Parameters:** `walletAddress` — Stellar wallet address of user to follow

**Response 200**
```json
{ "success": true, "message": "User followed successfully" }
```

**Errors:** `400` Cannot follow yourself

---

### DELETE /api/gamification/follow/:walletAddress

Unfollow a user. Requires authentication.

**Response 200**
```json
{ "success": true, "message": "User unfollowed successfully" }
```

---

### GET /api/gamification/followers

Get the authenticated user's followers. Requires authentication.

**Query Parameters:** `limit`, `offset`

**Response 200**
```json
{
  "success": true,
  "data": [{ "walletAddress": "GABC...XYZ", "followedAt": "2026-01-01T00:00:00.000Z" }]
}
```

---

### GET /api/gamification/following

Get users the authenticated user follows. Requires authentication.

**Response 200** — Same shape as followers

---

### GET /api/gamification/follow-counts

Get follower/following counts. Requires authentication.

**Response 200**
```json
{
  "success": true,
  "data": { "followers": 12, "following": 8 }
}
```

---

### GET /api/gamification/challenges

Get all active challenges. No authentication required.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "ch_001",
      "title": "First Contribution",
      "description": "Make your first group contribution",
      "type": "daily",
      "pointReward": 100,
      "endDate": "2026-03-27T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/gamification/challenges/user

Get challenges for the authenticated user. Requires authentication.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "challengeId": "ch_001",
      "status": "in_progress",
      "progress": 0,
      "challenge": { "title": "First Contribution", "pointReward": 100 }
    }
  ]
}
```

---

## Challenges

### GET /api/challenges

Get all currently active challenges.

**Response 200**
```json
{
  "success": true,
  "data": [{ "id": "ch_001", "title": "Weekly Saver", "type": "weekly", "pointReward": 200 }]
}
```

---

### GET /api/challenges/user

Get challenges for the authenticated user. Requires authentication.

**Response 200** — Array of user challenge progress objects

---

### GET /api/challenges/events

Get active seasonal events.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "ev_001",
      "name": "New Year Savings Sprint",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T00:00:00.000Z"
    }
  ]
}
```

---

## Referrals

### POST /api/referrals/generate

Generate or retrieve the authenticated user's referral code. Requires authentication.

**Response 200**
```json
{
  "code": "AJO-XYZ123",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### POST /api/referrals/validate

Validate a referral code.

**Request Body**
```json
{ "code": "AJO-XYZ123" }
```

**Response 200**
```json
{
  "valid": true,
  "referrerId": "GABC...XYZ"
}
```

**Errors:** `400` Invalid or expired code

---

### GET /api/referrals/stats

Get referral statistics for the authenticated user. Requires authentication.

**Response 200**
```json
{
  "totalReferrals": 10,
  "confirmedReferrals": 7,
  "pendingReferrals": 3,
  "totalRewardsEarned": 700
}
```

---

## Rewards

All rewards endpoints require authentication.

### GET /api/rewards

Get all rewards for the authenticated user.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: available, redeemed, expired |

**Response 200**
```json
{
  "rewards": [
    {
      "id": "rwd_001",
      "type": "FEE_DISCOUNT",
      "value": 10,
      "status": "available",
      "expiresAt": "2026-06-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/rewards/:id/redeem

Redeem a specific reward.

**Path Parameters:** `id` — Reward ID

**Response 200**
```json
{ "success": true, "reward": { "id": "rwd_001", "status": "redeemed" } }
```

**Errors:** `400` Already redeemed or expired, `404` Reward not found

---

### GET /api/rewards/history

Get complete reward history.

**Response 200**
```json
{
  "history": [
    {
      "id": "rwd_001",
      "type": "BONUS_TOKENS",
      "value": 50,
      "redeemedAt": "2026-02-15T00:00:00.000Z"
    }
  ]
}
```

---

## Disputes

### POST /api/disputes

File a dispute. Requires authentication.

**Request Body**
```json
{
  "groupId": "group_abc123",
  "type": "non_payment",
  "summary": "Member has not contributed for 2 cycles",
  "evidence": [
    { "type": "text", "content": "Transaction ID: abc123 shows no payment" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| groupId | string | yes | Group where dispute occurred |
| type | string | yes | `non_payment`, `fraud`, `rule_violation` |
| summary | string | no | Description of the issue |
| evidence | array | no | Array of evidence objects |

**Response 201**
```json
{
  "success": true,
  "dispute": {
    "id": "disp_001",
    "groupId": "group_abc123",
    "type": "non_payment",
    "status": "open",
    "createdAt": "2026-03-26T10:00:00.000Z"
  }
}
```

**Errors:** `400` Missing required fields or invalid type, `401` Unauthorized

---

### GET /api/disputes/:id

Get a dispute by ID.

**Response 200**
```json
{
  "dispute": {
    "id": "disp_001",
    "groupId": "group_abc123",
    "type": "non_payment",
    "status": "voting",
    "summary": "Member has not contributed for 2 cycles",
    "evidence": [],
    "votes": [],
    "createdAt": "2026-03-26T10:00:00.000Z"
  }
}
```

**Errors:** `404` Dispute not found

---

### GET /api/disputes/group/:groupId

List all disputes for a group.

**Response 200**
```json
{
  "disputes": [{ "id": "disp_001", "type": "non_payment", "status": "open" }]
}
```

---

### POST /api/disputes/:id/vote

Vote on a dispute. Requires authentication.

**Request Body**
```json
{ "vote": "in_favor" }
```

`vote` must be `in_favor` or `against`

**Response 200**
```json
{ "success": true }
```

---

### POST /api/disputes/:id/escalate

Escalate a dispute to admin review. Requires authentication.

**Response 200**
```json
{ "success": true, "status": "escalated" }
```

---

### POST /api/disputes/:id/admin-resolve

Admin resolves a dispute. Requires admin authentication.

**Request Body**
```json
{
  "resolution": "in_favor_of_filer",
  "notes": "Evidence clearly shows non-payment"
}
```

**Response 200**
```json
{ "success": true, "status": "resolved" }
```

---

## KYC

### GET /api/kyc/status

Get KYC status for the authenticated user. Requires authentication.

**Response 200**
```json
{
  "status": {
    "level": 2,
    "kycStatus": "approved",
    "submittedAt": "2026-02-01T00:00:00.000Z",
    "approvedAt": "2026-02-03T00:00:00.000Z"
  }
}
```

---

### POST /api/kyc/request

Request KYC verification. Requires authentication.

**Response 200**
```json
{ "success": true }
```

---

### POST /api/kyc/upload

Upload a KYC document. Requires authentication.

**Request Body**
```json
{
  "docType": "passport",
  "data": "base64_encoded_document_data"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| docType | string | yes | Document type (passport, drivers_license, national_id, utility_bill) |
| data | string | yes | Base64-encoded document content |

**Response 200**
```json
{
  "document": {
    "id": "doc_001",
    "docType": "passport",
    "status": "pending"
  }
}
```

---

### POST /api/kyc/level *(Admin)*

Set a user's KYC level. Requires admin authentication.

**Request Body**
```json
{ "userId": "GABC...XYZ", "level": 2 }
```

**Response 200**
```json
{ "success": true }
```

---

### GET /api/kyc/summary *(Admin)*

Get a summary of all KYC requests. Requires admin authentication.

**Response 200**
```json
{
  "pending": 12,
  "approved": 145,
  "rejected": 8,
  "byLevel": { "0": 50, "1": 80, "2": 60, "3": 15 }
}
```

---

## Analytics

### POST /api/analytics

Track an analytics event.

**Request Body**
```json
{
  "type": "page_view",
  "userId": "GABC...XYZ",
  "groupId": "group_abc123",
  "eventData": { "page": "/groups" }
}
```

**Response 201**
```json
{ "success": true }
```

---

### GET /api/analytics/stats

Get aggregated analytics stats.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| start | ISO 8601 | Start of date range |
| end | ISO 8601 | End of date range |

**Response 200**
```json
{
  "totalUsers": 500,
  "activeGroups": 42,
  "totalContributions": "5000000000000",
  "advancedMetrics": {}
}
```

---

### GET /api/analytics/metrics

Get performance metrics.

**Response 200** — Metrics object

---

### GET /api/analytics/advanced

Get advanced BI metrics with optional date range.

**Query Parameters:** `start`, `end` (ISO 8601)

---

### GET /api/analytics/predictive

Get predictive analytics (churn prediction, risk scores).

---

### GET /api/analytics/funnel

Get funnel analysis data.

---

### GET /api/analytics/cohort

Get cohort analysis data.

**Query Parameters:** `limit` (default 12 months)

---

### POST /api/analytics/track

Track a specific named event.

**Request Body**
```json
{
  "eventType": "group_joined",
  "userId": "GABC...XYZ",
  "groupId": "group_abc123",
  "eventData": {}
}
```

---

### GET /api/analytics/users/:userId/metrics

Get metrics for a specific user.

---

### GET /api/analytics/groups/:groupId/metrics

Get metrics for a specific group.

---

### POST /api/analytics/export

Create a data export job.

**Request Body**
```json
{
  "format": "csv",
  "dateRange": { "start": "2026-01-01T00:00:00.000Z", "end": "2026-03-31T00:00:00.000Z" },
  "includeMetrics": true,
  "includePredictions": false,
  "includeFunnel": false
}
```

`format` options: `csv`, `excel`, `pdf`

**Response 201**
```json
{ "exportId": "exp_001", "status": "pending" }
```

---

### GET /api/analytics/export/:exportId/status

Check export job status.

**Response 200**
```json
{ "id": "exp_001", "status": "completed", "format": "csv" }
```

---

### GET /api/analytics/export/:exportId/download

Download a completed export file.

**Response** — File download (Content-Disposition: attachment)

---

### A/B Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analytics/ab-tests | Create a new A/B test |
| POST | /api/analytics/ab-tests/assign | Assign user to test variant |
| POST | /api/analytics/ab-tests/convert | Track a conversion |
| GET | /api/analytics/ab-tests/:testName/results | Get test results |
| POST | /api/analytics/ab-tests/:testName/stop | Stop a test |
| GET | /api/analytics/ab-tests/active | List active tests |
| GET | /api/analytics/ab-tests/history | List historical tests |

---

### Anomaly Detection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/anomalies | Get recent anomalies (query: `hours`) |
| GET | /api/analytics/anomalies/summary | Get anomaly summary |
| POST | /api/analytics/anomalies/detect | Trigger anomaly detection |
| POST | /api/analytics/anomalies/config | Add metric config |

---

## Webhooks

### GET /api/webhooks

List all registered webhook endpoints.

**Response 200**
```json
{
  "endpoints": [
    {
      "id": "wh_001",
      "url": "https://example.com/webhook",
      "events": ["contribution.created", "payout.executed"],
      "isActive": true
    }
  ]
}
```

---

### POST /api/webhooks

Register a new webhook endpoint.

**Request Body**
```json
{
  "url": "https://example.com/webhook",
  "events": ["contribution.created", "payout.executed"],
  "secret": "your_webhook_secret"
}
```

**Response 201** — Created webhook object

---

### PATCH /api/webhooks/:id

Update a webhook endpoint.

**Request Body** — Any subset of webhook fields

**Response 200** — Updated webhook object

---

### DELETE /api/webhooks/:id

Delete a webhook endpoint.

**Response 200**
```json
{ "success": true }
```

---

### GET /api/webhooks/stats

Get webhook delivery statistics.

---

### POST /api/webhooks/:id/test

Send a test event to a webhook endpoint.

**Response 200**
```json
{ "success": true, "statusCode": 200 }
```

---

## Admin

All admin endpoints require an admin JWT token. See [AUTHENTICATION.md](./AUTHENTICATION.md#admin-authentication).

### GET /api/admin/health

System health check.

---

### GET /api/admin/dashboard

Admin dashboard summary (health, recent audit logs, pending flags, KYC summary).

---

### GET /api/admin/users

List all users.

**Query Parameters:** `page`, `limit`, `status`, `search`

---

### GET /api/admin/users/:id

Get a user by ID including recent groups and transactions.

---

### POST /api/admin/users/:id/suspend

Suspend a user.

**Request Body**
```json
{ "reason": "Repeated missed contributions", "durationDays": 30 }
```

---

### POST /api/admin/users/:id/ban

Permanently ban a user.

**Request Body**
```json
{ "reason": "Confirmed fraud" }
```

---

### POST /api/admin/users/:id/reinstate

Reinstate a suspended or banned user.

---

### DELETE /api/admin/users/:id

Soft-delete a user.

**Request Body**
```json
{ "reason": "User requested account deletion" }
```

---

### GET /api/admin/groups

List all groups.

**Query Parameters:** `page`, `limit`, `status`, `search`

---

### POST /api/admin/groups/:id/cancel

Cancel an active group (triggers refunds).

**Request Body**
```json
{ "reason": "Group creator requested cancellation" }
```

---

### DELETE /api/admin/groups/:id

Delete a group.

**Request Body**
```json
{ "reason": "Fraudulent group" }
```

---

### GET /api/admin/transactions

List all transactions.

**Query Parameters:** `page`, `limit`, `type`, `userId`, `groupId`

---

### GET /api/admin/flags

Get pending moderation flags.

**Query Parameters:** `page`

---

### POST /api/admin/flags

Create a moderation flag.

**Request Body**
```json
{
  "contentType": "group",
  "contentId": "group_abc123",
  "reason": "Suspicious activity",
  "notes": "Multiple fraud reports"
}
```

---

### PUT /api/admin/flags/:id/resolve

Resolve a moderation flag.

**Request Body**
```json
{ "resolution": "removed", "notes": "Confirmed fraudulent group" }
```

---

### GET /api/admin/audit

Get audit logs.

**Query Parameters:** `adminId`, `action`, `targetType`, `startDate`, `endDate`, `page`, `limit`

---

### GET /api/admin/config

Get current system configuration.

---

### PUT /api/admin/config/maintenance

Toggle maintenance mode.

**Request Body**
```json
{ "enabled": true, "message": "Scheduled maintenance until 14:00 UTC" }
```

---

### PUT /api/admin/config/feature-flags

Toggle a feature flag.

**Request Body**
```json
{ "flag": "partial_contributions", "enabled": true }
```

---

### PUT /api/admin/config/rate-limits

Update rate limit settings.

**Request Body** — Rate limit config object

---

### PUT /api/admin/config/fees

Update fee settings.

**Request Body** — Fee config object

---

### GET /api/admin/reports/users

User registration and activity report.

**Query Parameters:** `startDate`, `endDate`

---

### GET /api/admin/reports/financial

Financial report (contributions, payouts, fees).

**Query Parameters:** `startDate`, `endDate`

---

### GET /api/admin/reports/activity

Platform activity report.

**Query Parameters:** `startDate`, `endDate`

---

*See [ERROR_CODES.md](./ERROR_CODES.md) for all error codes and [RATE_LIMITS.md](./RATE_LIMITS.md) for rate limiting details.*
