# PR: Group Invitation and Approval System

## Summary

Implements flexible access control for Ajo groups with support for open groups (existing behavior), invite-only groups, and approval-required groups.

## Changes

### New Types
- `GroupAccessType` enum: `Open`, `InviteOnly`, `ApprovalRequired`
- `GroupInvitation` struct with expiry handling
- `JoinRequest` struct with status tracking
- `RequestStatus` enum: `Pending`, `Approved`, `Rejected`

### New Functions
| Function | Description |
|----------|-------------|
| `invite_member` | Invite users to join invite-only groups |
| `accept_invitation` | Accept invitation and join group |
| `request_to_join` | Submit join request for approval groups |
| `approve_join_request` | Creator approves join requests |

### Modified Functions
- `create_group`: Added `access_type` parameter
- `join_group`: Enforces access control based on group type

### Events
- `member_invited` - Invitation sent
- `invitation_accepted` - Invitation used
- `join_requested` - Request submitted
- `join_approved` - Request approved

## Backward Compatibility
Open groups work exactly as before - no changes required for existing integrations.

## Testing
```bash
cd contracts/ajo
cargo test
```

## Related Issue
Closes #338
