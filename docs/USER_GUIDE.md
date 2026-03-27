# Ajo User Guide

> Ajo is a decentralized Rotating Savings and Credit Association (ROSCA) platform built on the Stellar blockchain. It lets communities create transparent, secure savings groups — no banks, no middlemen.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Connecting Your Wallet](#2-connecting-your-wallet)
3. [KYC Verification](#3-kyc-verification)
4. [Dashboard Overview](#4-dashboard-overview)
5. [Savings Groups](#5-savings-groups)
6. [Personal Goals](#6-personal-goals)
7. [Contributions](#7-contributions)
8. [Referrals & Rewards](#8-referrals--rewards)
9. [Gamification & Achievements](#9-gamification--achievements)
10. [Disputes & Arbitration](#10-disputes--arbitration)
11. [Analytics & Insights](#11-analytics--insights)
12. [Notifications & Settings](#12-notifications--settings)
13. [Admin Guide](#13-admin-guide)
14. [FAQ](#14-faq)

---

## 1. Getting Started

### What is Ajo?

Ajo is a digital version of the traditional "Ajo" or ROSCA (Rotating Savings and Credit Association). Members pool money together, and each cycle one member receives the full pot. The process rotates until every member has received a payout.

All group activity is recorded on the **Stellar blockchain** via Soroban smart contracts, making every transaction transparent and tamper-proof.

### Prerequisites

Before using Ajo you need:

- A modern web browser (Chrome, Firefox, Brave, or Edge)
- A **Freighter** or **LOBSTR** Stellar wallet browser extension
- XLM (Stellar Lumens) in your wallet to cover transaction fees and contributions

### Supported Wallets

| Wallet | Type | Notes |
|--------|------|-------|
| Freighter | Browser extension | Recommended |
| LOBSTR | Browser extension | Fully supported |

---

## 2. Connecting Your Wallet

### Step 1 — Install a Wallet

If you don't have a wallet yet:

- **Freighter**: Install from [freighter.app](https://freighter.app) or your browser's extension store
- **LOBSTR**: Install from [lobstr.co](https://lobstr.co) or your browser's extension store

Create a new wallet and securely store your seed phrase. Never share it with anyone.

### Step 2 — Connect to Ajo

1. Open the Ajo app in your browser
2. Click **Connect Wallet** in the top-right corner
3. Select your wallet (Freighter or LOBSTR)
4. Approve the connection request in your wallet extension
5. Your wallet address will appear in the header once connected

### Step 3 — Switch to Testnet (if applicable)

Ajo currently runs on **Stellar Testnet**. Make sure your wallet is set to testnet mode before connecting.

In Freighter: Settings → Network → Testnet

> **Note**: Testnet XLM has no real value. You can get free testnet XLM from the [Stellar Friendbot](https://friendbot.stellar.org).

---

## 3. KYC Verification

KYC (Know Your Customer) verification unlocks higher-tier features and larger contribution limits.

### KYC Levels

| Level | Name | Requirements | Features Unlocked |
|-------|------|-------------|-------------------|
| 0 | Unverified | None | Basic browsing |
| 1 | Email Verified | Email confirmation | Join groups, small contributions |
| 2 | ID Verified | Government-issued ID | Higher contribution limits |
| 3 | Full KYC | ID + Proof of address | All features, maximum limits |

### How to Complete KYC

1. Go to **Settings → Verification**
2. Click **Start Verification**
3. Select the level you want to achieve
4. Upload the required documents:
   - Level 1: Verify your email address
   - Level 2: Upload a government-issued photo ID (passport, driver's license, national ID)
   - Level 3: Upload ID + a recent utility bill or bank statement (dated within 3 months)
5. Submit and wait for admin review
6. You'll receive a notification once your status is updated

### Checking Your KYC Status

Navigate to **Settings → Verification** at any time to see your current level and any pending submissions.

---

## 4. Dashboard Overview

The dashboard is your home base. It gives you a snapshot of everything happening across your groups and goals.

### Dashboard Sections

**Summary Cards**
- Total contributed across all groups
- Total received from group payouts
- Active groups you're a member of
- Your current savings goal progress

**Active Groups**
A list of groups you belong to, showing the current round, next contribution due date, and your contribution status.

**Recent Activity**
A feed of recent transactions, achievements, and group events.

**Gamification Widget**
Your current level, points, active streaks, and any in-progress challenges.

**Quick Actions**
- Create a new group
- Join a group
- Add a savings goal
- Make a contribution

---

## 5. Savings Groups

Groups are the core of Ajo. Each group has a fixed contribution amount, cycle frequency, and member limit. Every cycle, one member receives the pooled funds.

### Browsing Groups

1. Click **Groups** in the navigation
2. Browse available groups or use filters:
   - Contribution amount range
   - Cycle frequency (weekly, monthly, etc.)
   - Available spots
3. Click any group card to view its details

### Creating a Group

1. Click **Create Group** from the dashboard or Groups page
2. Fill in the group details:

| Field | Description |
|-------|-------------|
| Group Name | A descriptive name for your group |
| Contribution Amount | How much each member contributes per cycle (in XLM) |
| Cycle Length | Duration of each cycle (e.g., 30 days) |
| Max Members | Maximum number of members allowed |

3. Review the details and click **Create Group**
4. Approve the transaction in your wallet
5. You'll be redirected to your new group's page once the transaction confirms

> Creating a group deploys a smart contract on Stellar. This requires a small XLM fee.

### Joining a Group

1. Find a group you want to join (browse or use an invite link)
2. Open the group detail page
3. Review the group rules: contribution amount, cycle length, member count
4. Click **Join Group**
5. Approve the transaction in your wallet

You'll be added to the group once the transaction confirms on-chain.

### Group Detail Page

The group detail page shows:

- **Overview**: Name, status, current round, contribution amount, cycle length
- **Members**: List of all members and their contribution status
- **Transactions**: Full history of contributions and payouts
- **Your Status**: Whether you've contributed this cycle and when your payout is scheduled

### Group Roles

| Role | Permissions |
|------|------------|
| Creator | Created the group; has admin-level control |
| Member | Can contribute and receive payouts |

### Contribution Cycle

Each cycle works like this:

1. All members contribute the agreed amount
2. Once all contributions are collected, the smart contract executes the payout
3. The designated member for that round receives the full pool
4. The cycle advances to the next round
5. This repeats until all members have received a payout

### Multi-Signature Groups

Some groups require multiple signatures to authorize payouts. If your group has multi-sig enabled:

1. A transaction proposal is created when a payout is triggered
2. Required signers receive a notification
3. Each signer approves the proposal in their wallet
4. Once the threshold is met, the payout executes automatically

### Group Invitations

Group creators can invite specific people:

1. Open your group's detail page
2. Click **Invite Members**
3. Share the generated invite link or enter a wallet address directly
4. Invited users will see a pending invitation on their dashboard

---

## 6. Personal Goals

Goals let you track individual savings targets outside of group activity.

### Creating a Goal

1. Go to **Dashboard** or the **Goals** section
2. Click **Add Goal**
3. Fill in:

| Field | Description |
|-------|-------------|
| Title | Name of your goal (e.g., "Emergency Fund") |
| Category | EMERGENCY, VACATION, EDUCATION, HOME, RETIREMENT, or CUSTOM |
| Target Amount | How much you want to save |
| Deadline | Target date to reach your goal |
| Visibility | Public (visible to others) or Private |

4. Click **Save Goal**

### Tracking Progress

Each goal card shows:
- Current amount saved vs. target
- Progress bar
- Days remaining until deadline
- Projected completion date based on your saving rate

### Affordability Check

Before committing to a goal, use the **Affordability Check** tool:

1. Open a goal or click **Check Affordability**
2. Enter your monthly income and existing expenses
3. The tool calculates whether the goal is achievable within your deadline

### Savings Projection

The **Projection** tool shows you different scenarios:

1. Open a goal and click **View Projection**
2. Adjust the monthly contribution slider
3. See how different amounts affect your completion date

### Goal Categories

| Category | Use Case |
|----------|---------|
| EMERGENCY | 3-6 months of living expenses |
| VACATION | Travel and holiday savings |
| EDUCATION | Tuition, courses, certifications |
| HOME | Down payment, renovations |
| RETIREMENT | Long-term retirement savings |
| CUSTOM | Any other savings target |

---

## 7. Contributions

### Making a Contribution

1. Go to your group's detail page
2. Click **Contribute**
3. Confirm the contribution amount
4. Approve the transaction in your wallet
5. The contribution is recorded on-chain once confirmed

### Partial Contributions

If your group supports partial contributions:

1. Click **Contribute** on the group page
2. Enter a partial amount (less than the full contribution)
3. You can top up later before the cycle closes

> Not all groups allow partial contributions. Check the group settings.

### Contribution History

View all your past contributions:
- Per group: Group detail page → Transactions tab
- All groups: Dashboard → Recent Activity or Analytics page

### Missed Contributions

If you miss a contribution deadline:
- You'll receive a reminder notification before the deadline
- Missing contributions may affect your gamification score and standing in the group
- Repeated missed contributions can result in a dispute being filed against you

---

## 8. Referrals & Rewards

### Getting Your Referral Code

1. Go to **Profile → Referrals**
2. Your unique referral code is displayed there
3. Share it with friends via the copy button or social share options

### How Referrals Work

1. Your friend signs up and enters your referral code
2. Once they complete their first contribution, the referral is confirmed
3. Both you and your friend receive rewards

### Reward Types

| Reward Type | Description |
|-------------|-------------|
| Fee Discount | Reduced transaction fees |
| Bonus Tokens | Extra XLM or platform tokens |
| Premium Features | Access to advanced features |
| NFT Badge | Collectible achievement badge |

### Redeeming Rewards

1. Go to **Profile → Rewards**
2. View your available rewards
3. Click **Redeem** on any eligible reward
4. The reward is applied to your account immediately

### Referral Statistics

Track your referral performance:
- Total referrals made
- Confirmed referrals (completed first contribution)
- Pending referrals
- Total rewards earned

---

## 9. Gamification & Achievements

Ajo rewards consistent saving behavior through a points and achievement system.

### Levels

| Level | Name | Points Required |
|-------|------|----------------|
| 1 | BRONZE | 0 |
| 2 | SILVER | 500 |
| 3 | GOLD | 2,000 |
| 4 | PLATINUM | 10,000 |

### Earning Points

You earn points by:
- Making on-time contributions
- Logging in daily (streak bonus)
- Completing challenges
- Referring new members
- Completing your savings goals
- Engaging with the community (following, activity)

### Streaks

- **Login Streak**: Log in every day to maintain your streak. Longer streaks give bonus points.
- **Contribution Streak**: Make contributions on time every cycle. Missing a contribution resets your streak.

### Achievements

Achievements are one-time milestones. Examples:

| Achievement | How to Earn |
|-------------|------------|
| First Contribution | Make your first group contribution |
| Goal Setter | Create your first savings goal |
| Streak Master | Maintain a 30-day login streak |
| Top Referrer | Refer 10+ confirmed members |
| Group Creator | Create your first savings group |

View all achievements at **Profile → Achievements**.

### Challenges

Challenges are time-limited tasks that reward extra points:

- **Daily Challenges**: Reset every 24 hours
- **Weekly Challenges**: Reset every Monday
- **Seasonal Challenges**: Special events with larger rewards

View active challenges at **Profile → Challenges** or on the dashboard widget.

### Leaderboard

The leaderboard ranks users by:
- Total points
- Most referrals
- Most active (contributions made)
- Best savers (goal completion rate)

Access the leaderboard from the **Community** page.

### Social Features

- **Follow** other users to see their public activity in your feed
- **Activity Feed**: See what your network is doing (contributions, achievements, goals)
- Your public profile shows your level, achievements, and public goals

---

## 10. Disputes & Arbitration

If something goes wrong in a group, the dispute system provides a structured resolution process.

### When to File a Dispute

File a dispute if:
- A member hasn't paid their contribution (non-payment)
- You suspect fraudulent activity
- A group rule has been violated

### Filing a Dispute

1. Go to the group where the issue occurred
2. Click **File Dispute**
3. Select the dispute type:
   - **Non-Payment**: A member missed their contribution
   - **Fraud**: Suspected fraudulent activity
   - **Rule Violation**: A group rule was broken
4. Write a clear summary of the issue
5. Attach evidence if available (screenshots, transaction IDs, etc.)
6. Submit the dispute

### Dispute Process

```
Filed → Community Vote → Resolution
                ↓ (if unresolved)
           Admin Escalation → Admin Decision
```

1. **Filed**: Dispute is created and visible to group members
2. **Community Vote**: Group members vote on the outcome
3. **Resolution**: If voting reaches consensus, the dispute is resolved
4. **Escalation**: If voting is inconclusive, an admin reviews and makes a final decision

### Voting on a Dispute

1. Go to the group's dispute section
2. Open the active dispute
3. Review the summary and evidence
4. Cast your vote (in favor of the filer or against)

### Checking Dispute Status

Track your disputes at **Profile → Disputes** or on the group's detail page.

---

## 11. Analytics & Insights

### Personal Analytics

Access your analytics at **Analytics** in the navigation:

- **Contribution History**: Chart of all contributions over time
- **Savings Rate**: How much you're saving per month
- **Goal Progress**: Status of all your savings goals
- **Group Performance**: Your activity across all groups
- **Completion Rate**: Percentage of cycles you've completed on time

### Group Analytics

Group creators can view group-level analytics:

- Total contributions collected
- Payout history
- Member participation rates
- Default rate (missed contributions)
- Risk score

### Exporting Data

1. Go to **Analytics**
2. Click **Export**
3. Choose format: CSV, Excel, or PDF
4. Select the date range
5. Download the file

---

## 12. Notifications & Settings

### Notification Types

| Notification | Trigger |
|-------------|---------|
| Contribution Due | Upcoming contribution deadline |
| Payout Received | You received a group payout |
| New Member | Someone joined your group |
| Dispute Filed | A dispute was filed in your group |
| Achievement Unlocked | You earned a new achievement |
| Referral Confirmed | Your referral completed their first contribution |
| KYC Status Update | Your verification status changed |

### Managing Notifications

1. Go to **Settings → Notifications**
2. Toggle individual notification types on or off
3. Choose delivery method: in-app, email, or browser push

### Account Settings

**Settings → Account**:
- View your wallet address
- Manage connected wallets
- Set display preferences (language, currency display)

**Settings → Security**:
- View active sessions
- Disconnect wallet

**Settings → Verification**:
- View and manage KYC status

---

## 13. Admin Guide

> This section is for platform administrators only.

### Accessing the Admin Panel

Navigate to `/admin`. Admin access requires a special admin JWT token.

### User Management

- **View Users**: Browse all registered users with search and filters
- **Suspend User**: Temporarily restrict a user's access
- **Ban User**: Permanently block a user
- **Reinstate User**: Restore access to a suspended/banned user
- **Delete User**: Permanently remove a user account

### Group Management

- **View All Groups**: Browse all groups on the platform
- **Cancel Group**: Cancel an active group (triggers refunds via smart contract)
- **Delete Group**: Remove a group from the platform

### Moderation

- **Flags**: Review content and behavior flags raised by users or automated systems
- **Resolve Flag**: Mark a flag as resolved with a note
- **Audit Logs**: Full audit trail of all admin actions

### System Configuration

- **Maintenance Mode**: Take the platform offline for maintenance
- **Feature Flags**: Enable or disable specific features
- **Rate Limits**: Adjust API rate limiting thresholds
- **Fee Settings**: Configure platform fee percentages

### Reports

- **User Reports**: Registration trends, KYC completion rates, activity metrics
- **Financial Reports**: Total contributions, payouts, fee revenue
- **Activity Reports**: DAU/MAU, feature usage, retention rates

### KYC Administration

- **KYC Summary**: Overview of all verification requests
- **Review Documents**: View uploaded documents and approve/reject
- **Set KYC Level**: Manually set a user's KYC level

---

## 14. FAQ

### General

**What is Ajo?**
Ajo is a blockchain-based platform for running Rotating Savings and Credit Associations (ROSCAs). Members pool money together each cycle, and one member receives the full pot. The rotation continues until everyone has received a payout.

**Is Ajo safe to use?**
All group funds are managed by audited Soroban smart contracts on the Stellar blockchain. No single person — including the Ajo team — can access or move funds without the required on-chain authorization. That said, always do your own research before joining any financial group.

**What blockchain does Ajo use?**
Ajo runs on the **Stellar network** using **Soroban** smart contracts. Stellar was chosen for its fast transaction times (3-5 seconds), low fees, and built-in support for financial applications.

**Is Ajo currently on mainnet or testnet?**
Ajo is currently deployed on **Stellar Testnet**. Testnet XLM has no real monetary value. A mainnet launch will be announced separately.

---

### Wallets & Authentication

**Which wallets are supported?**
Freighter and LOBSTR are both fully supported. Freighter is the recommended option.

**Do I need to create an account?**
No traditional account is needed. Your Stellar wallet address is your identity on Ajo. Connect your wallet and you're ready to go.

**What happens if I lose access to my wallet?**
Your wallet's seed phrase is the only way to recover access. Ajo has no ability to recover lost wallets. Store your seed phrase securely offline.

**Can I use multiple wallets?**
Each wallet address is a separate identity on Ajo. You can connect different wallets, but group memberships and history are tied to the specific wallet address used.

**Why does connecting my wallet require a signature?**
The signature proves you own the wallet. It's used to generate a secure session token (JWT) — no funds are moved during this step.

---

### Groups

**How do I find groups to join?**
Browse the Groups page. You can filter by contribution amount, cycle length, and available spots. You can also join via an invite link shared by a group creator.

**Can I leave a group after joining?**
Once you've joined a group and the cycle has started, leaving may not be possible depending on the group's smart contract configuration. Check the group rules before joining.

**What happens if a member doesn't contribute?**
If a member misses a contribution, other members can file a dispute. The dispute process involves community voting and, if needed, admin arbitration. Repeated non-payment can result in the member being removed from the group.

**How is the payout order determined?**
The payout order is set when the group is created and recorded in the smart contract. It's transparent and visible to all members.

**What are the fees for creating or joining a group?**
Creating a group requires a small XLM transaction fee (paid to the Stellar network, not to Ajo). Platform fees, if any, are configured by admins and displayed before you confirm any transaction.

**Can I create a private group?**
Yes. When creating a group, you can control who joins by using the invitation system rather than making the group publicly discoverable.

**What is multi-sig and do I need it?**
Multi-signature (multi-sig) requires multiple members to approve a payout before it executes. It adds an extra layer of security for larger groups. It's optional and configured at group creation.

---

### Contributions & Payouts

**What currency is used for contributions?**
Contributions are made in **XLM** (Stellar Lumens). The contribution amount is set when the group is created.

**When will I receive my payout?**
Your payout happens in the round assigned to you. The order is visible on the group detail page. Once all members contribute for your round, the smart contract automatically sends the payout to your wallet.

**What if I can't make a contribution on time?**
Contact your group members as soon as possible. Some groups support partial contributions. Missing a contribution will affect your gamification score and may trigger a dispute.

**Are payouts instant?**
Payouts execute on the Stellar blockchain, which typically confirms in 3-5 seconds. You should see the funds in your wallet almost immediately after the payout transaction is confirmed.

**Can I contribute more than the required amount?**
No. Contributions are fixed at the amount set when the group was created. This ensures fairness for all members.

---

### Goals

**Are goals connected to my group contributions?**
Goals are separate from group contributions. They're personal savings targets you track independently. However, your group payouts can be directed toward your goals manually.

**Can I share my goals publicly?**
Yes. When creating a goal, set visibility to **Public**. Public goals appear on your profile and in the community feed.

**What happens when I reach my goal?**
The goal is marked as **Completed** and you earn achievement points. You can archive it or keep it visible on your profile.

---

### KYC

**Why do I need KYC verification?**
KYC helps prevent fraud and ensures compliance. Higher KYC levels unlock larger contribution limits and additional features.

**How long does KYC verification take?**
Admin review typically takes 1-3 business days. You'll receive a notification when your status is updated.

**What documents are accepted?**
- Level 2: Passport, driver's license, or national ID card
- Level 3: The above plus a utility bill or bank statement dated within the last 3 months

**Is my personal data secure?**
KYC documents are stored securely and only accessible to authorized admins. They are not shared with third parties or stored on the blockchain.

---

### Gamification

**Do points have monetary value?**
No. Points are used for leaderboard rankings and unlocking achievements. They don't have direct monetary value.

**What happens if I miss a day and break my streak?**
Your streak resets to zero. There's no way to recover a broken streak, so try to log in daily if you want to maintain it.

**Can I see other users' achievements?**
Yes, if a user's profile is public. You can view their level, achievements, and public goals.

---

### Disputes

**How long does a dispute take to resolve?**
Community voting typically runs for a set period (e.g., 72 hours). If escalated to admin, resolution depends on admin availability but is typically handled within 5 business days.

**Can I appeal an admin decision?**
Currently, admin decisions are final. Contact support if you believe there was an error.

**What evidence should I include in a dispute?**
Include transaction IDs, screenshots, dates, and any relevant communication. The more specific and documented your evidence, the better.

---

### Technical

**What happens if a transaction fails?**
If a transaction fails on-chain, no funds are moved. You'll see an error message and can retry. Common causes include insufficient XLM for fees or network congestion.

**Why is the app slow sometimes?**
The app fetches data from both the backend database and the Stellar blockchain. Blockchain queries can occasionally be slower during network congestion.

**Does Ajo work offline?**
Basic browsing is available offline. However, any action that requires a blockchain transaction (contributing, joining groups, etc.) requires an internet connection.

**I found a bug. How do I report it?**
Open an issue on the project's GitHub repository or contact the team via the support channel listed in the app's Help section.

---

*Last updated: March 2026*
