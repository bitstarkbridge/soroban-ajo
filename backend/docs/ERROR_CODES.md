# Error Codes Reference

All API errors follow a consistent JSON structure:

```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

`details` is optional and only present when additional context is available (e.g., validation field errors).

---

## HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — authenticated but not permitted |
| 404 | Not Found |
| 409 | Conflict — resource already exists |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable — external dependency down |
| 504 | Gateway Timeout |

---

## Application Error Codes

### Authentication & Authorization

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | No token provided, or token is invalid/expired |
| `FORBIDDEN` | 403 | Authenticated but lacks required permission |

**Example**
```json
{
  "success": false,
  "error": "No token provided",
  "code": "UNAUTHORIZED"
}
```

---

### Validation

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request body or query params failed schema validation |

**Example**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "contributionAmount", "message": "Expected number, received string" }
  ]
}
```

---

### Resources

| Code | Status | Description |
|------|--------|-------------|
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate referral code, already a group member) |

**Example**
```json
{
  "success": false,
  "error": "Group with identifier 'group_abc123' not found",
  "code": "NOT_FOUND"
}
```

---

### Rate Limiting

| Code | Status | Description |
|------|--------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests in the current window |

**Example**
```json
{
  "status": 429,
  "error": "Rate limit exceeded. Please slow down your requests.",
  "retryAfter": 847,
  "limit": 100
}
```

The response also includes these headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1711441234
Retry-After: 847
```

---

### Blockchain & Transactions

| Code | Status | Description |
|------|--------|-------------|
| `CONTRACT_ERROR` | 500 | Soroban smart contract call failed |
| `TRANSACTION_ERROR` | 500 | Stellar transaction submission failed |
| `INSUFFICIENT_BALANCE` | 400 | Wallet balance too low for the operation |

**Example — Insufficient Balance**
```json
{
  "success": false,
  "error": "Insufficient balance. Required: 500000000, Available: 100000000",
  "code": "INSUFFICIENT_BALANCE",
  "details": {
    "required": 500000000,
    "available": 100000000
  }
}
```

**Example — Transaction Error**
```json
{
  "success": false,
  "error": "Transaction submission failed",
  "code": "TRANSACTION_ERROR",
  "details": {
    "txHash": "abc123...",
    "reason": "op_underfunded"
  }
}
```

---

### Network & External Services

| Code | Status | Description |
|------|--------|-------------|
| `NETWORK_ERROR` | 503 | External service (Stellar RPC, SendGrid, etc.) is unreachable |
| `TIMEOUT_ERROR` | 504 | Operation exceeded the allowed time limit |

**Example**
```json
{
  "success": false,
  "error": "Operation 'soroban_rpc_call' timed out after 30000ms",
  "code": "TIMEOUT_ERROR",
  "details": {
    "operation": "soroban_rpc_call",
    "timeout": 30000
  }
}
```

---

### Internal

| Code | Status | Description |
|------|--------|-------------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

In production, internal error details are sanitized and not exposed to clients.

---

## Dispute-Specific Errors

| HTTP Status | Message | Cause |
|-------------|---------|-------|
| 400 | `groupId and type required` | Missing required fields |
| 400 | `invalid dispute type` | `type` must be `non_payment`, `fraud`, or `rule_violation` |
| 401 | `Unauthorized` | No valid auth token |
| 404 | `Not found` | Dispute ID does not exist |

---

## KYC-Specific Errors

| HTTP Status | Message | Cause |
|-------------|---------|-------|
| 400 | `docType and data are required` | Missing upload fields |
| 401 | `Unauthorized` | No valid auth token |
| 404 | `User not found` | Wallet address not registered |
| 500 | `Failed to request verification` | Internal KYC service error |

---

## Handling Errors in Code

### JavaScript

```js
const res = await fetch('/api/groups/invalid_id')
if (!res.ok) {
  const err = await res.json()
  console.error(err.code, err.error) // "NOT_FOUND", "Group ... not found"
}
```

### Python

```python
import requests

res = requests.get('https://api.ajo.app/api/groups/invalid_id')
if not res.ok:
    err = res.json()
    print(err['code'], err['error'])  # NOT_FOUND, Group ... not found
```

### Handling 429 with Retry-After

```js
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, options)
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '60')
      await new Promise(r => setTimeout(r, retryAfter * 1000))
      continue
    }
    return res
  }
  throw new Error('Max retries exceeded')
}
```
