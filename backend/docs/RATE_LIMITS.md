# Rate Limiting Guide

Ajo uses a multi-tier rate limiting system backed by Redis. Limits are applied per IP address and, for authenticated requests, per user.

---

## Tiers

| Tier | Applies To | Dev Limit | Prod Limit | Window |
|------|-----------|-----------|------------|--------|
| `global` | All requests | 200 req | 100 req | 1 minute |
| `auth` | `/api/auth/*` endpoints | 20 req | 10 req | 15 minutes |
| `api` | General API endpoints | 200 req | 100 req | 15 minutes |
| `expensive` | Resource-intensive endpoints | 20 req | 10 req | 1 hour |

---

## DDoS Protection

A separate DDoS detection layer blocks IPs that exceed a burst threshold:

| Setting | Dev | Prod |
|---------|-----|------|
| Detection window | 1 minute | 1 minute |
| Request threshold | 100 req | 60 req |
| Block duration | 10 minutes | 1 hour |

Blocked IPs receive a `429` response until the block expires.

---

## Rate Limit Headers

Every response includes standard rate limit headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1711441234
```

When a limit is exceeded, the response also includes:

```
Retry-After: 847
```

---

## 429 Response Body

```json
{
  "status": 429,
  "error": "Rate limit exceeded. Please slow down your requests.",
  "retryAfter": 847,
  "limit": 100
}
```

| Field | Description |
|-------|-------------|
| retryAfter | Seconds until the window resets |
| limit | Maximum requests allowed in the window |

---

## IP Allowlist

Specific IPs can be exempted from all rate limiting via the `RATE_LIMIT_IP_ALLOWLIST` environment variable:

```
RATE_LIMIT_IP_ALLOWLIST=192.168.1.1,10.0.0.5
```

This is intended for internal services and monitoring systems only.

---

## Environment Variable Overrides

All limits can be tuned via environment variables:

| Variable | Default (dev) | Default (prod) | Description |
|----------|--------------|----------------|-------------|
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | 60000 | 60000 | Global window (ms) |
| `RATE_LIMIT_GLOBAL_MAX` | 200 | 100 | Global max requests |
| `RATE_LIMIT_AUTH_WINDOW_MS` | 900000 | 900000 | Auth window (ms) |
| `RATE_LIMIT_AUTH_MAX` | 20 | 10 | Auth max requests |
| `RATE_LIMIT_API_WINDOW_MS` | 900000 | 900000 | API window (ms) |
| `RATE_LIMIT_API_MAX` | 200 | 100 | API max requests |
| `RATE_LIMIT_EXPENSIVE_WINDOW_MS` | 3600000 | 3600000 | Expensive window (ms) |
| `RATE_LIMIT_EXPENSIVE_MAX` | 20 | 10 | Expensive max requests |
| `RATE_LIMIT_DDOS_WINDOW_MS` | 60000 | 60000 | DDoS detection window (ms) |
| `RATE_LIMIT_DDOS_THRESHOLD` | 100 | 60 | DDoS burst threshold |
| `RATE_LIMIT_DDOS_BLOCK_DURATION_MS` | 600000 | 3600000 | DDoS block duration (ms) |
| `RATE_LIMIT_IP_ALLOWLIST` | "" | "" | Comma-separated IP allowlist |

---

## Best Practices for API Consumers

1. **Check `RateLimit-Remaining`** before making bulk requests and back off when it's low
2. **Respect `Retry-After`** — wait the specified number of seconds before retrying after a 429
3. **Cache responses** where possible to reduce request volume
4. **Batch operations** rather than making many individual requests
5. **Use exponential backoff** for retry logic

### Retry Example (JavaScript)

```js
async function apiRequest(url, options = {}, retries = 3) {
  const res = await fetch(url, options)

  if (res.status === 429 && retries > 0) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '60') * 1000
    await new Promise(resolve => setTimeout(resolve, retryAfter))
    return apiRequest(url, options, retries - 1)
  }

  return res
}
```

### Retry Example (Python)

```python
import time
import requests

def api_request(url, **kwargs):
    for attempt in range(3):
        res = requests.get(url, **kwargs)
        if res.status_code == 429:
            retry_after = int(res.headers.get('Retry-After', 60))
            time.sleep(retry_after)
            continue
        return res
    raise Exception('Rate limit retries exhausted')
```
