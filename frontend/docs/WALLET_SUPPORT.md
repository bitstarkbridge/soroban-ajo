# Wallet Support in Ajo Platform

The Ajo platform supports multiple Stellar wallets to provide users with flexibility in how they interact with the application.

## Supported Wallets

### 1. Freighter Wallet ✅ (Fully Supported)
**Type:** Browser Extension  
**Platforms:** Desktop (Chrome, Firefox, Edge, Brave)  
**Status:** Production Ready

**Features:**
- Full transaction signing
- Network switching (Testnet/Mainnet)
- Auth entry signing
- Account management

**Installation:**
- Visit [freighter.app](https://www.freighter.app/)
- Install the browser extension
- Create or import a Stellar account

**Usage in Ajo:**
- Click "Connect Wallet"
- Select "Freighter"
- Approve the connection in the Freighter popup
- Start using Ajo!

---

### 2. Lobstr Wallet ✅ (Newly Added)
**Type:** Mobile App + Browser Extension (Lobstr Vault)  
**Platforms:** iOS, Android, Desktop (via Lobstr Vault extension)  
**Status:** Production Ready

**Features:**
- Mobile-first experience
- Lobstr Vault extension for desktop
- Transaction signing
- Built-in exchange
- Asset management

**Installation:**

**For Mobile:**
1. Download Lobstr from [App Store](https://apps.apple.com/app/lobstr-stellar-lumens-wallet/id1404357892) or [Google Play](https://play.google.com/store/apps/details?id=com.lobstr.client)
2. Create or import your Stellar account
3. Visit Ajo on your mobile browser

**For Desktop:**
1. Install [Lobstr Vault](https://vault.lobstr.co/) browser extension
2. Set up your vault account
3. Visit Ajo and connect with Lobstr

**Usage in Ajo:**

**Mobile:**
- Click "Connect Wallet"
- Select "Lobstr Vault"
- You'll be redirected to the Lobstr app
- Approve the connection
- Return to Ajo to continue

**Desktop:**
- Click "Connect Wallet"
- Select "Lobstr Vault"
- Approve the connection in the Lobstr Vault popup
- Start using Ajo!

**Important Notes:**
- Lobstr mobile uses deep-link authentication
- Desktop users need the Lobstr Vault extension
- Lobstr typically uses Mainnet by default

---

### 3. Albedo Wallet 🚧 (Coming Soon)
**Type:** Web-based (No installation required)  
**Platforms:** All platforms with web browser  
**Status:** Planned

**Features:**
- No installation required
- Works on any device
- Transaction signing
- Multi-signature support

**Installation:**
- No installation needed
- Visit [albedo.link](https://albedo.link/)

---

### 4. xBull Wallet 🚧 (Coming Soon)
**Type:** Browser Extension + Mobile App  
**Platforms:** Desktop and Mobile  
**Status:** Planned

---

## Wallet Comparison

| Feature | Freighter | Lobstr | Albedo | xBull |
|---------|-----------|--------|--------|-------|
| Desktop Support | ✅ | ✅ (Vault) | 🚧 | 🚧 |
| Mobile Support | ❌ | ✅ | 🚧 | 🚧 |
| Installation Required | Yes | Yes | No | Yes |
| Network Switching | ✅ | ✅ | 🚧 | 🚧 |
| Transaction Signing | ✅ | ✅ | 🚧 | 🚧 |
| Auth Entry Signing | ✅ | ⚠️ (Fallback) | 🚧 | 🚧 |
| Status | ✅ Ready | ✅ Ready | 🚧 Planned | 🚧 Planned |

---

## Technical Implementation

### Freighter Integration
```typescript
// Uses @stellar/freighter-api package
import { waitForFreighterApi } from '@/utils/freighter'

const freighter = await waitForFreighterApi()
const address = await freighter.getPublicKey()
```

### Lobstr Integration
```typescript
// Desktop: Uses Lobstr Vault extension
import { connectLobstrVault } from '@/utils/lobstr'

const result = await connectLobstrVault()
const address = result.address

// Mobile: Uses deep-link protocol
const deepLink = `lobstr://auth?callback=${callbackUrl}`
window.location.href = deepLink
```

---

## For Developers

### Adding a New Wallet

1. **Update Types** (`frontend/src/types/auth.ts` and `frontend/src/types/wallet.ts`):
```typescript
export type WalletProvider = 'freighter' | 'albedo' | 'xbull' | 'lobstr' | 'your-wallet'
```

2. **Create Utility File** (`frontend/src/utils/your-wallet.ts`):
```typescript
export async function connectYourWallet(): Promise<ConnectionResult> {
  // Implementation
}
```

3. **Update Auth Service** (`frontend/src/services/authService.ts`):
```typescript
case 'your-wallet': {
  const result = await connectYourWallet()
  return { address: result.address, signature, network }
}
```

4. **Update Wallet Detection** (`frontend/src/hooks/useWallet.ts`):
```typescript
{
  name: 'Your Wallet',
  type: 'your-wallet',
  isInstalled: typeof window !== 'undefined' && !!window.yourWallet,
}
```

5. **Update UI** (`frontend/src/components/WalletConnect.tsx`):
- Add wallet name to display logic
- Add installation link

---

## Troubleshooting

### Freighter Issues
- **"Freighter not found"**: Install the extension and refresh the page
- **"Connection denied"**: Check that you've approved the connection in Freighter
- **"Wrong network"**: Switch network in Freighter settings

### Lobstr Issues
- **"Lobstr Vault not found"** (Desktop): Install the Lobstr Vault extension
- **"Deep link failed"** (Mobile): Ensure Lobstr app is installed
- **"Authentication timeout"**: Try again and complete the flow within 60 seconds
- **"Wrong network"**: Lobstr typically uses Mainnet - switch to Testnet in app settings if needed

### General Issues
- **"No wallet detected"**: Install at least one supported wallet
- **"Connection failed"**: Check your internet connection and try again
- **"Transaction failed"**: Ensure you have sufficient XLM balance for fees

---

## Security Best Practices

1. **Never share your secret key** - Wallets should never ask for it
2. **Verify transaction details** - Always review before signing
3. **Use hardware wallets** - For large amounts (Ledger support coming soon)
4. **Keep extensions updated** - Install updates promptly
5. **Beware of phishing** - Always check the URL is correct

---

## Future Wallet Support

We're actively working on adding support for:
- ✅ Lobstr Wallet (Added!)
- 🚧 Albedo (In Progress)
- 🚧 xBull (Planned)
- 🚧 Ledger Hardware Wallet (Planned)
- 🚧 Rabet Wallet (Planned)
- 🚧 WalletConnect v2 (Planned)

---

## Feedback

Have a wallet you'd like us to support? [Open an issue](https://github.com/your-repo/issues) or contact us!
