# Authentication Guide

Ajo uses **JWT (JSON Web Token)** authentication tied to Stellar wallet public keys. There are no passwords — your wallet is your identity.

---

## How It Works

1. User connects their Stellar wallet (Freighter or LOBSTR)
2. Frontend requests a JWT token from the API using the wallet's public key
3. The JWT is included in the `Authorization` header for all protected requests
4. Tokens expire after **7 days** (configurable via `JWT_EXPIRES_IN`)

---

## Getting a Token

### POST /api/auth/token

**Request Body**
```json
{
  "publicKey": "GABC1234567890EXAMPLESTELLARWALLETADDRESSXYZ"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**

| Status | Description |
|--------|-------------|
| 400 | Missing or invalid `publicKey` |
| 500 | Token generation failed |

---

## Using the Token

Include the token in every protected request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Token Payload

The JWT payload contains:

```json
{
  "publicKey": "GABC...XYZ",
  "iat": 1711440000,
  "exp": 1712044800
}
```

| Field | Description |
|-------|-------------|
| publicKey | Stellar wallet public key (used as user identity) |
| iat | Issued at (Unix timestamp) |
| exp | Expiry (Unix timestamp, 7 days after `iat`) |

---

## Token Expiry & Refresh

Tokens are not automatically refreshed. When a token expires:

- The API returns `401 Unauthorized` with `{ "error": "Invalid or expired token" }`
- The client must request a new token via `POST /api/auth/token`

---

## Admin Authentication

Admin endpoints use a separate admin JWT. Admin tokens are issued out-of-band (not via the public API). Include them the same way:

```
Authorization: Bearer <admin_jwt_token>
```

Admin tokens carry additional permission claims:

```json
{
  "id": "admin_001",
  "permissions": ["users:read", "users:suspend", "groups:read", "groups:delete", "moderation:read", "moderation:write", "audit:read", "config:read", "config:write", "reports:read", "transactions:read"]
}
```

---

## Code Examples

### curl

```bash
# Get token
curl -X POST https://api.ajo.app/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"publicKey": "GABC...XYZ"}'

# Use token
curl https://api.ajo.app/api/goals \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (fetch)

```js
// Get token
const { token } = await fetch('/api/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publicKey: wallet.publicKey }),
}).then(r => r.json())

// Store and reuse
localStorage.setItem('ajo_token', token)

// Authenticated request
const goals = await fetch('/api/goals', {
  headers: { Authorization: `Bearer ${localStorage.getItem('ajo_token')}` },
}).then(r => r.json())
```

### Python (requests)

```python
import requests

# Get token
resp = requests.post('https://api.ajo.app/api/auth/token', json={
    'publicKey': 'GABC...XYZ'
})
token = resp.json()['token']

# Authenticated request
headers = {'Authorization': f'Bearer {token}'}
goals = requests.get('https://api.ajo.app/api/goals', headers=headers).json()
```

### TypeScript (axios)

```ts
import axios from 'axios'

const api = axios.create({ baseURL: 'https://api.ajo.app' })

// Get token
const { data } = await api.post('/api/auth/token', { publicKey })
const token = data.token

// Set default header
api.defaults.headers.common['Authorization'] = `Bearer ${token}`

// All subsequent requests are authenticated
const goals = await api.get('/api/goals')
```

---

## Security Notes

- Never expose your JWT in client-side logs or URLs
- Tokens are signed with `HS256` using a server-side secret (`JWT_SECRET` env var)
- The `publicKey` in the token is used as the user's identity across all services — it maps to `walletAddress` in the database
- Admin tokens should be rotated regularly and never committed to source control
