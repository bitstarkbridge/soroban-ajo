# Smart Contract Integration Guide

This guide covers everything you need to integrate with the Soroban Ajo smart contract — from local setup through the full contribution lifecycle, error handling, and event listening.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Contract Architecture](#contract-architecture)
5. [Two-Phase Transaction Flow](#two-phase-transaction-flow)
6. [Contract Functions Reference](#contract-functions-reference)
7. [REST API Reference](#rest-api-reference)
8. [Frontend SDK Integration](#frontend-sdk-integration)
9. [Event Listening](#event-listening)
10. [Error Reference](#error-reference)
11. [Token Amounts and Stroops](#token-amounts-and-stroops)
12. [Advanced Features](#advanced-features)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)

---

## Overview

Soroban Ajo is a rotating savings group (ROSCA) contract deployed on the Stellar network. Members contribute a fixed amount each cycle, and one member receives the full pool per round until everyone has been paid out.

```
Members contribute → Pool accumulates → Payout executes → Cycle advances → Repeat
```

The backend acts as a stateless relay — it never holds private keys. All state-mutating transactions follow a **two-phase sign-and-submit** pattern:

1. Client requests unsigned XDR from the backend
2. Client signs with their wallet (Freighter, Albedo, etc.)
3. Client submits the signed XDR back to the backend
4. Backend submits to the network and polls for confirmation

---

## Prerequisites

- Node.js 18+
- Rust + `soroban-cli` (for contract deployment)
- A funded Stellar testnet account ([Friendbot](https://friendbot.stellar.org))
- [Freighter wallet](https://www.freighter.app/) for browser-based signing

Install `soroban-cli`:

```bash
cargo install --locked soroban-cli
```

---

## Environment Setup

Copy `.env.example` to `.env` in the `backend/` directory and fill in the values:

```env
# Stellar / Soroban
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
SOROBAN_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_CONTRACT_ID=<your_deployed_contract_id>
SOROBAN_NETWORK=testnet

# Used as the source account for read-only simulations (must be funded)
SOROBAN_SIMULATION_ACCOUNT=GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN

# Backend
PORT=3001
JWT_SECRET=<strong-random-secret>
```

For **mainnet**, change:

```env
SOROBAN_RPC_URL=https://soroban-mainnet.stellar.org
SOROBAN_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
SOROBAN_NETWORK=mainnet
```

---

## Contract Architecture

The contract is written in Rust using `soroban-sdk = "21.0.0"` and compiled to WASM.

### Storage layout

| Key pattern | Storage type | Description |
|---|---|---|
| `"ADMIN"` | Instance | Contract administrator address |
| `"GCOUNTER"` | Instance | Auto-incrementing group ID counter |
| `("GROUP", group_id)` | Persistent | Full `Group` struct |
| `("CONTRIB", group_id, cycle, member)` | Persistent | Contribution flag per member per cycle |
| `("PAYOUT", group_id, member)` | Persistent | Whether member has received payout |
| `("PENPOOL", group_id, cycle)` | Persistent | Penalty pool balance for a cycle |
| `("MSTATS", member)` | Persistent | Aggregated member statistics |
| `("MACHIEV", member)` | Persistent | Member achievement records |
| `("INSPOOL", token)` | Instance | Insurance pool balance per token |

### Key types

```rust
// Group ID — u64, auto-assigned starting from 1
// Amounts  — i128 in stroops (1 XLM = 10_000_000 stroops)
// Time     — u64 Unix timestamp in seconds
```

---

## Two-Phase Transaction Flow

All write operations (create group, join, contribute) use this pattern to keep private keys on the client.

```
Client                          Backend                     Stellar Network
  │                                │                               │
  │── POST /api/groups ──────────► │                               │
  │   { name, adminPublicKey, … }  │                               │
  │                                │── simulateTransaction ───────►│
  │                                │◄── resource footprint ────────│
  │◄── { unsignedXdr } ───────────│                               │
  │                                │                               │
  │  [user signs with wallet]      │                               │
  │                                │                               │
  │── POST /api/groups ──────────► │                               │
  │   { …, signedXdr }             │── sendTransaction ───────────►│
  │                                │── pollForConfirmation ────────►│
  │◄── { groupId, txHash } ───────│◄── SUCCESS ───────────────────│
```

### Phase 1 — Get unsigned XDR

```typescript
const phase1 = await fetch('/api/groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  body: JSON.stringify({
    name: 'Family Savings',
    description: 'Monthly family savings group',
    contributionAmount: '50000000', // 5 XLM in stroops
    frequency: 'monthly',
    maxMembers: 6,
    adminPublicKey: 'GABC...XYZ',
  }),
})
const { data: { unsignedXdr } } = await phase1.json()
```

### Phase 2 — Sign and submit

```typescript
// Sign with Freighter
import { signTransaction } from '@stellar/freighter-api'

const signedXdr = await signTransaction(unsignedXdr, {
  networkPassphrase: 'Test SDF Network ; September 2015',
})

const phase2 = await fetch('/api/groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
  body: JSON.stringify({
    name: 'Family Savings',
    description: 'Monthly family savings group',
    contributionAmount: '50000000',
    frequency: 'monthly',
    maxMembers: 6,
    adminPublicKey: 'GABC...XYZ',
    signedXdr,
  }),
})
const { data: { groupId, txHash } } = await phase2.json()
```

---

## Contract Functions Reference

### `initialize(admin: Address) → Result<(), AjoError>`

One-time setup. Sets the contract administrator. Fails with `AlreadyInitialized` if called again.

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin-key \
  --network testnet \
  -- initialize \
  --admin GADMIN...ADDRESS
```

---

### `create_group(...) → Result<u64, AjoError>`

Creates a new group. The creator is automatically added as the first member.

| Parameter | Type | Description |
|---|---|---|
| `creator` | `Address` | Group creator (requires auth) |
| `token_address` | `Address` | SAC token contract (XLM, USDC, etc.) |
| `contribution_amount` | `i128` | Fixed amount per cycle in stroops |
| `cycle_duration` | `u64` | Cycle length in seconds |
| `max_members` | `u32` | 2–100 members |
| `grace_period` | `u64` | Seconds after cycle end for late contributions (max 7 days) |
| `penalty_rate` | `u32` | Late penalty percentage 0–100 |
| `insurance_rate_bps` | `u32` | Insurance premium in basis points (0 = disabled) |

Returns the new `group_id` (u64).

**Validation rules:**
- `contribution_amount` must be > 0
- `cycle_duration` must be > 0
- `max_members` must be 2–100
- `grace_period` must be ≤ 604,800 seconds (7 days)
- `penalty_rate` must be 0–100

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source creator-key \
  --network testnet \
  -- create_group \
  --creator GCREATOR...ADDRESS \
  --token_address CTOKEN...ADDRESS \
  --contribution_amount 50000000 \
  --cycle_duration 2592000 \
  --max_members 6 \
  --grace_period 86400 \
  --penalty_rate 5 \
  --insurance_rate_bps 100
```

---

### `join_group(member: Address, group_id: u64) → Result<(), AjoError>`

Adds a member to an open group. Requires member authentication.

**Conditions:**
- Group must exist and not be complete or cancelled
- Member must not already be in the group
- Group must not be full
- For `InviteOnly` groups: a valid, non-expired invitation must exist
- For `ApprovalRequired` groups: direct joining is blocked

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source member-key \
  --network testnet \
  -- join_group \
  --member GMEMBER...ADDRESS \
  --group_id 1
```

---

### `contribute(member: Address, group_id: u64) → Result<(), AjoError>`

Records a contribution for the current cycle and transfers tokens from the member to the contract.

**Conditions:**
- Member must be in the group
- Member must not have already contributed this cycle
- Group must not be complete or cancelled
- Member must have sufficient token balance
- Contribution must be within the cycle window or grace period

Late contributions (after cycle end but within grace period) incur a penalty deducted from the contribution and added to the cycle's penalty pool.

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source member-key \
  --network testnet \
  -- contribute \
  --member GMEMBER...ADDRESS \
  --group_id 1
```

---

### `execute_payout(group_id: u64) → Result<(), AjoError>`

Executes the payout for the current cycle. Can be called by anyone once conditions are met.

**Conditions:**
- All members must have contributed
- Grace period must have expired
- Group must not be complete or cancelled

The payout amount is `contribution_amount × member_count + cycle_penalty_pool`. After payout, the cycle advances. When all members have received a payout, the group is marked complete.

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source any-key \
  --network testnet \
  -- execute_payout \
  --group_id 1
```

---

### `get_group(group_id: u64) → Result<Group, AjoError>`

Returns the full group struct.

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- get_group \
  --group_id 1
```

---

### `get_group_status(group_id: u64) → Result<GroupStatus, AjoError>`

Returns a comprehensive snapshot: current cycle, pending contributors, timing, payout recipient, and penalty pool. Use this for dashboards.

```typescript
// Via backend simulation (no fee)
const res = await fetch('/api/groups/1')
const { data } = await res.json()
// data.currentCycle, data.isActive, data.nextPayoutDate, etc.
```

---

### `get_contribution_status(group_id: u64, cycle_number: u32) → Result<Vec<(Address, bool)>, AjoError>`

Returns each member paired with their contribution status for a given cycle.

---

### `list_members(group_id: u64) → Result<Vec<Address>, AjoError>`

Returns the ordered member list. Join order is preserved; the creator is always first.

---

### `is_member(group_id: u64, address: Address) → Result<bool, AjoError>`

Quick membership check.

---

### `pause(env) / unpause(env)`

Admin-only emergency controls. When paused, all state-mutating operations fail with `ContractPaused`. Read operations continue to work.

---

## REST API Reference

Base URL: `http://localhost:3001/api`

All protected routes require `Authorization: Bearer <jwt>`.

### Groups

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/groups` | No | List all groups (paginated) |
| `GET` | `/groups/:id` | No | Get group by ID |
| `POST` | `/groups` | Yes | Create group (phase 1 or 2) |
| `GET` | `/groups/:id/members` | No | List group members |
| `POST` | `/groups/:id/join` | Yes | Join group (phase 1 or 2) |
| `POST` | `/groups/:id/contribute` | Yes | Contribute (phase 1 or 2) |
| `GET` | `/groups/:id/transactions` | No | List transactions (paginated) |

### Pagination

All list endpoints accept `?page=1&limit=20` (max limit: 100).

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Create group — Phase 1

```http
POST /api/groups
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Family Savings",
  "description": "Monthly family savings group",
  "contributionAmount": "50000000",
  "frequency": "monthly",
  "maxMembers": 6,
  "adminPublicKey": "GABC...XYZ"
}
```

Response:

```json
{ "success": true, "data": { "unsignedXdr": "AAAA..." } }
```

### Create group — Phase 2

Same body as Phase 1, plus `signedXdr`:

```json
{
  "name": "Family Savings",
  "description": "Monthly family savings group",
  "contributionAmount": "50000000",
  "frequency": "monthly",
  "maxMembers": 6,
  "adminPublicKey": "GABC...XYZ",
  "signedXdr": "AAAA..."
}
```

Response (HTTP 201):

```json
{ "success": true, "data": { "groupId": "1", "txHash": "abc123..." } }
```

### Join group

```http
POST /api/groups/1/join
Authorization: Bearer <jwt>

{ "publicKey": "GMEMBER...XYZ" }
```

Phase 2 adds `signedXdr` to the body.

### Contribute

```http
POST /api/groups/1/contribute
Authorization: Bearer <jwt>

{ "publicKey": "GMEMBER...XYZ", "amount": "50000000" }
```

Phase 2 adds `signedXdr` to the body.

---

## Frontend SDK Integration

The frontend uses `@tanstack/react-query` with a custom `SorobanService` wrapper. Here is the recommended pattern for calling write operations from a React component:

```typescript
import { useContribute } from '@/hooks/useContractData'

function ContributeButton({ groupId }: { groupId: string }) {
  const contribute = useContribute()

  const handleContribute = async () => {
    // Phase 1: get unsigned XDR
    const result = await contribute.mutateAsync({ groupId, amount: 50_000_000 })

    if (result.unsignedXdr) {
      // Phase 2: sign with Freighter and resubmit
      const { signTransaction } = await import('@stellar/freighter-api')
      const signedXdr = await signTransaction(result.unsignedXdr, {
        networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
      })
      await contribute.mutateAsync({ groupId, amount: 50_000_000, signedXdr })
    }
  }

  return (
    <button onClick={handleContribute} disabled={contribute.isPending}>
      {contribute.isPending ? 'Processing...' : 'Contribute'}
    </button>
  )
}
```

### Reading group data

```typescript
import { useGroupDetail, useGroupMembers, useGroupStatus } from '@/hooks/useContractData'

function GroupDashboard({ groupId }: { groupId: string }) {
  const { data: group, isLoading } = useGroupDetail(groupId)
  const { data: members } = useGroupMembers(groupId)

  if (isLoading) return <SkeletonCard />

  return (
    <div>
      <p>Cycle: {group?.currentCycle}</p>
      <p>Members: {members?.length}</p>
    </div>
  )
}
```

### Cache invalidation

After a successful write, invalidate the relevant queries so the UI reflects the new state:

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/hooks/useContractData'

const queryClient = useQueryClient()

// After a contribution
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_DETAIL(groupId) })
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_MEMBERS(groupId) })
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS(groupId) })
```

---

## Event Listening

The contract emits events for all state changes. Off-chain services can subscribe via the Stellar RPC `getEvents` endpoint or the backend webhook system.

### Event topics

| Symbol | Trigger | Payload |
|---|---|---|
| `"created"` | Group created | `(creator, contribution_amount, max_members)` |
| `"joined"` | Member joined | `member` |
| `"contrib"` | Contribution made | `(member, amount)` |
| `"payout"` | Payout executed | `(recipient, amount)` |
| `"complete"` | Group completed | `()` |
| `"late"` | Late contribution | `(member, amount, penalty)` |
| `"pendistr"` | Penalty distributed | `(recipient, base_amount, penalty_bonus)` |
| `"cancel"` | Group cancelled | `(creator, member_count, refund_per_member)` |
| `"achieve"` | Achievement earned | `(member, achievement_id)` |
| `"mileston"` | Milestone reached | `(milestone_id, cycle)` |
| `"remind"` | Contribution reminder | `(member, reminder_type, deadline)` |

### Polling for events via RPC

```typescript
import * as StellarSdk from 'stellar-sdk'

const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org')

const events = await server.getEvents({
  startLedger: latestLedger,
  filters: [
    {
      type: 'contract',
      contractIds: [process.env.SOROBAN_CONTRACT_ID],
      topics: [['*', '*']], // all events from this contract
    },
  ],
})

for (const event of events.events) {
  const topic = event.topic[0]?.sym()?.toString()
  console.log('Event:', topic, event.value)
}
```

### Webhook integration

The backend fires webhooks after confirmed on-chain writes. Configure target URLs in `.env`:

```env
WEBHOOK_URLS=https://your-service.com/hooks/ajo
WEBHOOK_SECRETS=your-hmac-secret
```

Webhook payloads are HMAC-SHA256 signed. Verify the `X-Webhook-Signature` header:

```typescript
import crypto from 'crypto'

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
```

---

## Error Reference

All contract errors are typed as `AjoError` (u32 codes). The backend maps these to HTTP responses.

| Code | Name | Description |
|---|---|---|
| 1 | `GroupNotFound` | Group ID does not exist |
| 2 | `MaxMembersExceeded` | Group is full |
| 3 | `AlreadyMember` | Address is already in the group |
| 4 | `NotMember` | Address is not in the group |
| 5 | `AlreadyContributed` | Member already contributed this cycle |
| 6 | `IncompleteContributions` | Not all members have contributed |
| 7 | `AlreadyReceivedPayout` | Member already received their payout |
| 8 | `GroupComplete` | All cycles finished |
| 9 | `ContributionAmountZero` | Amount must be > 0 |
| 10 | `CycleDurationZero` | Duration must be > 0 |
| 11 | `MaxMembersBelowMinimum` | Need at least 2 members |
| 12 | `InsufficientBalance` | Member lacks token balance |
| 13 | `TransferFailed` | Token transfer failed |
| 15 | `Unauthorized` | Caller not authorized |
| 16 | `OutsideCycleWindow` | Grace period not yet expired (for payout) |
| 18 | `MaxMembersAboveLimit` | Max members exceeds 100 |
| 19 | `GroupCancelled` | Group has been cancelled |
| 21 | `ContractPaused` | Contract is paused by admin |
| 24 | `GracePeriodExpired` | Contribution too late |
| 25 | `InvalidGracePeriod` | Grace period > 7 days |
| 26 | `InvalidPenaltyRate` | Penalty rate > 100 |
| 39 | `InsufficientContractBalance` | Contract lacks funds for payout |

### Handling errors in TypeScript

```typescript
import { SorobanServiceError } from '@/services/sorobanService'

try {
  await contribute(groupId, publicKey, amount)
} catch (err) {
  if (err instanceof SorobanServiceError) {
    switch (err.code) {
      case 'SIMULATION_ERROR':
        // Contract rejected the call — check AjoError in err.message
        break
      case 'TX_TIMEOUT':
        // Network congestion — safe to retry
        break
      case 'TX_FAILED':
        // On-chain failure — do not retry without investigating
        break
    }
  }
}
```

---

## Token Amounts and Stroops

All amounts in the contract are denominated in **stroops** (the smallest XLM unit).

```
1 XLM = 10,000,000 stroops
```

```typescript
// Convert XLM to stroops
const toStroops = (xlm: number): string => String(Math.round(xlm * 10_000_000))

// Convert stroops to XLM
const fromStroops = (stroops: string): number => Number(stroops) / 10_000_000

// Examples
toStroops(5)     // "50000000"  — 5 XLM
fromStroops('50000000')  // 5
```

For USDC and other tokens, use the token's own decimal precision (typically 7 for Stellar SAC tokens).

---

## Advanced Features

### Payout ordering strategies

Groups support five strategies set at creation time:

| Strategy | Value | Description |
|---|---|---|
| `Sequential` | 0 | Join order (default) |
| `Random` | 1 | Verifiable random using ledger entropy |
| `VotingBased` | 2 | Members vote each cycle |
| `ContributionBased` | 3 | Best on-time record wins |
| `NeedBased` | 4 | Members vote on declared need |

### Access control

| Type | Value | Behaviour |
|---|---|---|
| `Open` | 0 | Anyone can join directly |
| `InviteOnly` | 1 | Creator must issue an invitation |
| `ApprovalRequired` | 2 | Creator must approve join requests |

### Insurance

Set `insurance_rate_bps > 0` at group creation to enable the insurance pool. A percentage of each contribution is deposited into the pool. Members can file claims for non-payment via `auto_verify_insurance_claim`.

```
insurance_rate_bps = 100  →  1% of each contribution goes to the pool
```

### Penalties

Late contributions (after cycle end, within grace period) incur a penalty:

```
penalty = contribution_amount × (penalty_rate / 100)
net_contribution = contribution_amount - penalty
penalty_pool += penalty
```

The penalty pool is added to the current cycle's payout, rewarding on-time members.

### Multi-token groups

Groups can accept multiple SAC tokens with configurable weights. Use `create_multi_token_group` and configure `MultiTokenConfig` with up to 10 accepted tokens.

---

## Testing

### Run contract tests

```bash
cd contracts/ajo
cargo test
```

Test snapshots are stored in `contracts/ajo/test_snapshots/`. The test suite covers the full lifecycle: group creation, joining, contributions, payouts, edge cases, and error paths.

### Run backend tests

```bash
cd backend
npm test
```

### Manual testing with soroban-cli

```bash
# Fund a test account
curl "https://friendbot.stellar.org?addr=GTEST...ADDRESS"

# Deploy contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_ajo.wasm \
  --source deployer-key \
  --network testnet

# Initialize
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin-key \
  --network testnet \
  -- initialize \
  --admin GADMIN...ADDRESS

# Full lifecycle test
soroban contract invoke --id $CONTRACT_ID --source alice --network testnet \
  -- create_group \
  --creator GALICE...ADDRESS \
  --token_address CTOKEN...ADDRESS \
  --contribution_amount 10000000 \
  --cycle_duration 60 \
  --max_members 3 \
  --grace_period 30 \
  --penalty_rate 5 \
  --insurance_rate_bps 0
```

---

## Troubleshooting

**`SIMULATION_ERROR: ContractPaused`**
The admin has paused the contract. Contact the admin or check the contract state.

**`TX_TIMEOUT` after submission**
The transaction was submitted but not confirmed within 30 seconds. Check the hash on [Stellar Expert](https://stellar.expert/explorer/testnet) — it may still confirm. Do not resubmit without verifying.

**`InsufficientBalance` during contribute**
The member's wallet does not hold enough of the group's token. Ensure the account is funded and has approved the token transfer.

**`OutsideCycleWindow` during execute_payout**
The grace period has not yet expired. Wait until `grace_period_end_time` (available in `get_group_status`) before calling `execute_payout`.

**`IncompleteContributions` during execute_payout**
Not all members have contributed. Check `get_contribution_status` to see who is pending.

**Simulation account not funded**
The `SOROBAN_SIMULATION_ACCOUNT` in `.env` must be a funded Stellar account. Use Friendbot on testnet to fund it.

**XDR decode errors on the frontend**
Ensure the `networkPassphrase` passed to `signTransaction` matches the backend's `SOROBAN_NETWORK_PASSPHRASE` exactly, including spaces and punctuation.
