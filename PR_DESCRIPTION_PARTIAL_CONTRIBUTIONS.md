# Partial Contribution Support - Issue #337

## Overview
This PR implements the ability for group members to make partial contributions towards their required amount over multiple transactions. This is particularly useful for:
- Members who want to budget their contributions over time
- Groups with high contribution requirements that need to be met incrementally
- Better tracking of contribution progress per cycle

## Changes Made

### Smart Contract Changes

#### 1. New Type: `PartialContribution` (types.rs)
Added a new contract type to track member contributions:
- `member`: Address of the contributing member
- `group_id`: The group identifier
- `cycle`: The contribution cycle number
- `total_contributed`: Total amount contributed so far
- `required_amount`: The full amount required
- `is_complete`: Whether the full amount has been contributed
- `payment_count`: Number of partial payments made

#### 2. Storage Helpers (storage.rs)
Added functions to manage partial contribution storage:
- `store_partial_contribution`: Save partial contribution data
- `get_partial_contribution`: Retrieve partial contribution data
- `has_partial_contribution`: Check if partial contribution exists
- Storage key: `StorageKey::PartialContribution`

#### 3. Event Emission (events.rs)
Added event for tracking partial contributions:
- `emit_partial_contribution`: Emits when a partial payment is made

#### 4. Contract Functions (contract.rs)

##### New Functions:
- `contribute_partial(group_id, cycle, amount)`:
  - Allows members to contribute partial amounts
  - Prevents over-contribution (reverts if total exceeds required)
  - Auto-completes when required amount is reached
  - Requires authentication from the contributor

- `get_partial_contribution_status(member, group_id, cycle)`:
  - Query function to get current partial contribution status
  - Returns all contribution details including progress

## Testing
- Built successfully with `soroban contract build`
- All existing functionality preserved
- Partial contribution tracking works correctly

## Related Issues
- Closes #337

## Checklist
- [x] Smart contract builds successfully
- [x] Partial contribution tracking implemented
- [x] Over-contribution prevention
- [x] Event emission for partial payments
- [x] Query function for status
- [x] Tests pass

## Notes
- This feature complements the Group Invitation System (Issue #338)
- Combined with the job queue system (Issue #332), the AJO platform now has:
  - Robust background job processing
  - Flexible group membership (invitations + approvals)
  - Partial contribution support for budget-friendly participation
