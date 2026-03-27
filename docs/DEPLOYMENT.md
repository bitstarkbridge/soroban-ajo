# Deployment Guide

Step-by-step instructions for deploying the Soroban Ajo smart contract, backend API, and frontend application — from local development through production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Production Checklist](#production-checklist)
7. [Environment Variable Reference](#environment-variable-reference)
8. [Updating a Deployed Contract](#updating-a-deployed-contract)
9. [Rollback Procedures](#rollback-procedures)
10. [Monitoring and Health Checks](#monitoring-and-health-checks)

---

## Prerequisites

Install these tools before starting.

### System requirements

| Tool | Minimum version | Install |
|---|---|---|
| Node.js | 18.17.0 | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm i -g pnpm` |
| Rust | stable (2021 edition) | [rustup.rs](https://rustup.rs) |
| soroban-cli | latest | `cargo install --locked soroban-cli` |
| Docker | 24+ | [docker.com](https://docker.com) |
| Git | 2.40+ | system package manager |

### Verify installations

```bash
node --version        # v18.17.0+
pnpm --version        # 8+
rustc --version       # rustc 1.7x.x
soroban --version     # soroban 21.x.x
docker --version      # Docker 24.x.x
```

### Add the Wasm target for contract compilation

```bash
rustup target add wasm32-unknown-unknown
```

---

## Repository Setup

```bash
git clone https://github.com/Christopherdominic/soroban-ajo.git
cd soroban-ajo
```

The repo has three independent deployable units:

```
soroban-ajo/
├── contracts/ajo/   # Rust/Soroban smart contract
├── backend/         # Node.js/Express API
└── frontend/        # Next.js 14 app
```

---

## Smart Contract Deployment

### 1. Build the contract

```bash
cd contracts/ajo

cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM is written to:

```
contracts/ajo/target/wasm32-unknown-unknown/release/soroban_ajo.wasm
```

Alternatively, use `soroban-cli` to build and optimise in one step:

```bash
soroban contract build
```

### 2. Run tests before deploying

```bash
cargo test
```

All tests must pass. Test snapshots live in `contracts/ajo/test_snapshots/`.

### 3. Configure the network

```bash
# Testnet (recommended for first deployment)
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Mainnet
soroban network add mainnet \
  --rpc-url https://soroban-mainnet.stellar.org \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

### 4. Create and fund a deployer account

```bash
# Generate a new keypair
soroban keys generate deployer --network testnet

# Show the public key
soroban keys address deployer

# Fund on testnet via Friendbot
curl "https://friendbot.stellar.org?addr=$(soroban keys address deployer)"
```

For mainnet, fund the account with real XLM before proceeding.

### 5. Deploy the contract

```bash
CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_ajo.wasm \
  --source deployer \
  --network testnet)

echo "Contract ID: $CONTRACT_ID"
```

Save the contract ID — you will need it for the backend and frontend `.env` files.

### 6. Initialize the contract

The contract must be initialized exactly once to set the admin address.

```bash
# Generate an admin keypair (separate from deployer)
soroban keys generate admin --network testnet
curl "https://friendbot.stellar.org?addr=$(soroban keys address admin)"

# Initialize
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address admin)
```

### 7. Verify deployment

```bash
# Should return the admin address
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- get_group \
  --group_id 0 2>&1 | grep -i "GroupNotFound\|error"
# GroupNotFound is expected — it confirms the contract is live
```

---

## Backend Deployment

### Local development

```bash
cd backend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env` — at minimum set:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<generate with: openssl rand -hex 64>
SOROBAN_CONTRACT_ID=<from contract deployment step>
DATABASE_URL=postgresql://ajo:ajo_password@localhost:5432/ajo
REDIS_URL=redis://localhost:6379
SOROBAN_SIMULATION_ACCOUNT=<a funded Stellar address for read-only simulations>
```

Start PostgreSQL and Redis with Docker:

```bash
docker compose up -d
```

This starts `postgres:16-alpine` on port 5432 with:
- User: `ajo`
- Password: `ajo_password`
- Database: `ajo`

Push the Prisma schema to the database:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
# Server running on http://localhost:3001
```

Verify:

```bash
curl http://localhost:3001/health
# {"status":"ok","timestamp":"..."}
```

### Production build

```bash
# Compile TypeScript to dist/
npm run build

# Start the compiled server
NODE_ENV=production npm start
```

The entry point is `dist/index.js`.

### Deploying to a cloud platform

The backend is a standard Node.js/Express app. Below are instructions for the most common platforms.

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

railway login
railway init
railway up
```

Set environment variables in the Railway dashboard under **Variables**. Add a PostgreSQL plugin and a Redis plugin — Railway injects `DATABASE_URL` and `REDIS_URL` automatically.

#### Render

1. Create a new **Web Service** pointing to the `backend/` directory.
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Add a **PostgreSQL** database and a **Redis** instance from the Render dashboard.
5. Copy the connection strings into the environment variables panel.

#### Docker (self-hosted / VPS)

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t ajo-backend .
docker run -p 3001:3001 --env-file .env ajo-backend
```

### Database migrations in production

```bash
# Apply pending migrations (safe for production — no data loss)
npm run db:migrate:deploy

# Never use db:migrate:reset in production — it drops all data
```

---

## Frontend Deployment

### Local development

```bash
cd frontend

# Install dependencies (uses pnpm lock file)
pnpm install

# Copy and fill in environment variables
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=<from contract deployment step>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PWA push notifications (optional for dev)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@ajo.app
```

Generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

Start the development server:

```bash
pnpm dev
# App running on http://localhost:3000
```

### Production build

```bash
pnpm build
pnpm start
```

`next build` produces an optimised production bundle. The PWA service worker (`next-pwa`) is only generated in production mode — it is intentionally skipped in development.

### Deploying to Vercel (recommended)

Vercel is the simplest option for Next.js 14 with App Router.

```bash
# Install Vercel CLI
npm i -g vercel

vercel login
vercel --prod
```

Or connect the GitHub repository in the Vercel dashboard:

1. Import the repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables under **Settings → Environment Variables**:

```
NEXT_PUBLIC_SOROBAN_RPC_URL
NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE
NEXT_PUBLIC_SOROBAN_CONTRACT_ID
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

5. Deploy.

### Deploying to Netlify

```bash
npm i -g netlify-cli
netlify login
cd frontend
netlify init
netlify build
netlify deploy --prod
```

Add a `netlify.toml` in `frontend/`:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Deploying to a VPS / Docker

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm i -g pnpm && pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Enable standalone output in `next.config.js`:

```js
const nextConfig = {
  output: 'standalone',
  // ... rest of config
}
```

Build and run:

```bash
docker build -t ajo-frontend .
docker run -p 3000:3000 --env-file .env.local ajo-frontend
```

---

## Production Checklist

Work through this list before going live.

### Smart contract

- [ ] All `cargo test` tests pass
- [ ] Contract deployed to mainnet with a funded admin account
- [ ] `initialize` called exactly once
- [ ] Contract ID saved and added to backend and frontend `.env`
- [ ] Admin keypair stored securely (hardware wallet or secrets manager)
- [ ] Simulation account funded with at least 10 XLM

### Backend

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is a cryptographically random 64-byte hex string
- [ ] `DATABASE_URL` points to a managed PostgreSQL instance (not Docker)
- [ ] `REDIS_URL` points to a managed Redis instance
- [ ] `FRONTEND_URL` set to the production frontend domain
- [ ] `npm run db:migrate:deploy` run against the production database
- [ ] Rate limiting values reviewed (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`)
- [ ] Webhook secrets rotated from example values
- [ ] HTTPS enforced (via reverse proxy or platform TLS)
- [ ] Health endpoint responding: `GET /health`

### Frontend

- [ ] All `NEXT_PUBLIC_*` variables set to production values
- [ ] `NEXT_PUBLIC_APP_URL` set to the production domain
- [ ] `NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE` matches the deployed network
- [ ] VAPID keys generated and set for push notifications
- [ ] `pnpm build` completes without errors
- [ ] PWA manifest and service worker verified in browser DevTools

---

## Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | HTTP port (default: `3001`) |
| `FRONTEND_URL` | Yes | Allowed CORS origin |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `SOROBAN_RPC_URL` | Yes | Stellar RPC endpoint |
| `SOROBAN_NETWORK_PASSPHRASE` | Yes | Network passphrase |
| `SOROBAN_CONTRACT_ID` | Yes | Deployed contract address |
| `SOROBAN_NETWORK` | Yes | `testnet` or `mainnet` |
| `SOROBAN_SIMULATION_ACCOUNT` | Yes | Funded account for read simulations |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `SENDGRID_API_KEY` | No | For email notifications |
| `EMAIL_FROM` | No | Sender address for emails |
| `WEBHOOK_URLS` | No | Comma-separated webhook targets |
| `WEBHOOK_SECRETS` | No | Comma-separated HMAC secrets (same order as URLs) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: `900000`) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window (default: `100`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Yes | Stellar RPC endpoint |
| `NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE` | Yes | Network passphrase |
| `NEXT_PUBLIC_SOROBAN_CONTRACT_ID` | Yes | Deployed contract address |
| `NEXT_PUBLIC_APP_NAME` | No | App display name (default: `Ajo`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the frontend |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | No | VAPID public key for push notifications |
| `VAPID_PRIVATE_KEY` | No | VAPID private key (server-side only) |
| `VAPID_SUBJECT` | No | Contact email for VAPID |

---

## Updating a Deployed Contract

The contract supports admin-controlled WASM upgrades via the `upgrade` function.

### 1. Build the new WASM

```bash
cd contracts/ajo
cargo build --target wasm32-unknown-unknown --release
```

### 2. Upload the new WASM to the network

```bash
NEW_WASM_HASH=$(soroban contract install \
  --wasm target/wasm32-unknown-unknown/release/soroban_ajo.wasm \
  --source admin \
  --network testnet)

echo "New WASM hash: $NEW_WASM_HASH"
```

### 3. Pause the contract (optional but recommended)

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- pause
```

When paused, all state-mutating operations return `ContractPaused`. Read operations continue to work.

### 4. Upgrade

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- upgrade \
  --new_wasm_hash $NEW_WASM_HASH
```

### 5. Unpause

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- unpause
```

The contract ID does not change after an upgrade. No backend or frontend environment variable updates are needed.

---

## Rollback Procedures

### Contract rollback

Re-upload the previous WASM and call `upgrade` with its hash. Keep a record of all deployed WASM hashes.

```bash
# Re-install the previous WASM
PREV_WASM_HASH=$(soroban contract install \
  --wasm path/to/previous/soroban_ajo.wasm \
  --source admin \
  --network testnet)

soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- upgrade \
  --new_wasm_hash $PREV_WASM_HASH
```

### Backend rollback

```bash
# Revert to the previous Git tag
git checkout v1.2.3
npm install
npm run build
npm start
```

For database schema rollbacks:

```bash
# Roll back the most recent migration
npx prisma migrate resolve --rolled-back <migration_name>
```

### Frontend rollback

On Vercel, open **Deployments**, find the last working deployment, and click **Promote to Production**.

On other platforms, redeploy from the previous Git tag:

```bash
git checkout v1.2.3
pnpm install
pnpm build
```

---

## Monitoring and Health Checks

### Backend health endpoint

```bash
curl https://your-api.com/health
```

Expected response:

```json
{ "status": "ok", "timestamp": "2026-03-27T12:00:00.000Z" }
```

### API documentation

Swagger UI is available at:

```
http://localhost:3001/api-docs
```

### Logs

The backend uses Winston with daily log rotation. In production, logs are written to:

```
logs/combined-YYYY-MM-DD.log
logs/error-YYYY-MM-DD.log
```

To tail logs on a VPS:

```bash
tail -f logs/combined-$(date +%Y-%m-%d).log
```

### Contract state verification

```bash
# Check a group exists and is active
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- get_group_status \
  --group_id 1

# Check contract is not paused (any read call works)
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- is_complete \
  --group_id 1
```

### Recommended uptime monitoring

Point an uptime monitor (Better Uptime, UptimeRobot, etc.) at:

- `GET /health` on the backend
- The frontend root URL

Set alerts for response time > 2s or any non-200 status.
