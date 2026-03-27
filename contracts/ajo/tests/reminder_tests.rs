#![cfg(test)]

//! Tests for the contribution reminder and notification system.
//!
//! Covers preference storage/retrieval, reminder triggering logic across
//! different time windows (before deadline, grace period, overdue), and
//! edge cases such as members who already contributed or disabled notifications.

use soroban_ajo::{AjoContract, AjoContractClient, AjoError, ReminderType};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

fn setup_test() -> (Env, AjoContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract(token_admin);
    let creator = Address::generate(&env);

    (env, client, creator, token)
}

/// Creates a group with two members and returns (group_id, creator, member2).
fn setup_group(
    env: &Env,
    client: &AjoContractClient,
    token: &Address,
) -> (u64, Address, Address) {
    let creator = Address::generate(env);
    let member2 = Address::generate(env);

    let cycle_duration = 604_800u64; // 1 week
    let grace_period = 86_400u64; // 1 day
    let group_id = client.create_group(
        &creator,
        token,
        &100_000_000i128,
        &cycle_duration,
        &5u32,
        &grace_period,
        &5u32,
        &0u32,
    );

    client.join_group(&member2, &group_id);
    (group_id, creator, member2)
}

// ── Preference tests ─────────────────────────────────────────────────────────

#[test]
fn test_set_and_get_notification_preferences() {
    let (env, client, _, _token) = setup_test();
    let member = Address::generate(&env);

    client.set_notification_preferences(&member, &true, &24u64, &true, &true);

    let prefs = client.get_notification_preferences(&member);
    assert_eq!(prefs.member, member);
    assert_eq!(prefs.enabled, true);
    assert_eq!(prefs.reminder_hours_before, 24);
    assert_eq!(prefs.grace_period_reminders, true);
    assert_eq!(prefs.payout_notifications, true);
}

#[test]
fn test_update_notification_preferences() {
    let (env, client, _, _token) = setup_test();
    let member = Address::generate(&env);

    // Set initial preferences
    client.set_notification_preferences(&member, &true, &24u64, &true, &true);

    // Update to different values
    client.set_notification_preferences(&member, &false, &48u64, &false, &false);

    let prefs = client.get_notification_preferences(&member);
    assert_eq!(prefs.enabled, false);
    assert_eq!(prefs.reminder_hours_before, 48);
    assert_eq!(prefs.grace_period_reminders, false);
    assert_eq!(prefs.payout_notifications, false);
}

#[test]
fn test_get_preferences_not_found() {
    let (env, client, _, _token) = setup_test();
    let member = Address::generate(&env);

    let result = client.try_get_notification_preferences(&member);
    assert_eq!(result, Err(Ok(AjoError::PreferencesNotFound)));
}

// ── Reminder triggering tests ────────────────────────────────────────────────

#[test]
fn test_trigger_contribution_due_reminder() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, member2) = setup_group(&env, &client, &token);

    // member2 opts in: remind 48 hours before deadline
    client.set_notification_preferences(&member2, &true, &48u64, &true, &true);

    // Advance time to 24 hours before cycle end (within 48h threshold)
    // cycle_duration = 604800s (1 week), so cycle_end ≈ start + 604800
    // We want now = cycle_end - 24h = cycle_end - 86400
    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 - 86_400; // 6 days in
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    // member2 hasn't contributed and is within threshold → should be reminded
    // creator also hasn't contributed but has no prefs → not reminded
    assert_eq!(reminded.len(), 1);
    assert_eq!(reminded.get(0).unwrap(), member2);

    // Verify the record was persisted
    let record = client.get_reminder_history(&group_id, &1u32, &member2);
    assert_eq!(record.group_id, group_id);
    assert_eq!(record.cycle, 1);
    assert_eq!(record.reminder_type, ReminderType::ContributionDue);
}

#[test]
fn test_no_reminder_when_outside_threshold() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, member2) = setup_group(&env, &client, &token);

    // member2 opts in with a 12-hour threshold
    client.set_notification_preferences(&member2, &true, &12u64, &true, &true);

    // Advance only 1 day — still 6 days from deadline, well outside 12h
    env.ledger().with_mut(|li| {
        li.timestamp += 86_400;
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    assert_eq!(reminded.len(), 0);
}

#[test]
fn test_grace_period_reminder() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, member2) = setup_group(&env, &client, &token);

    // member2 opts in with grace period reminders enabled
    client.set_notification_preferences(&member2, &true, &24u64, &true, &true);

    // Advance past cycle end but within grace period
    // cycle_end = start + 604800, grace_end = cycle_end + 86400
    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 + 3_600; // 1 hour into grace period
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    assert_eq!(reminded.len(), 1);

    let record = client.get_reminder_history(&group_id, &1u32, &member2);
    assert_eq!(record.reminder_type, ReminderType::GracePeriod);
}

#[test]
fn test_overdue_reminder() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, member2) = setup_group(&env, &client, &token);

    // member2 opts in but disables grace period reminders
    client.set_notification_preferences(&member2, &true, &24u64, &false, &true);

    // Advance past both cycle end and grace period
    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 + 86_400 + 1; // past grace end
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    assert_eq!(reminded.len(), 1);

    let record = client.get_reminder_history(&group_id, &1u32, &member2);
    assert_eq!(record.reminder_type, ReminderType::Overdue);
}

#[test]
fn test_no_reminder_for_disabled_member() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, member2) = setup_group(&env, &client, &token);

    // member2 opts in but then disables
    client.set_notification_preferences(&member2, &false, &48u64, &true, &true);

    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 - 86_400;
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    assert_eq!(reminded.len(), 0);
}

#[test]
fn test_no_reminder_for_member_without_preferences() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, _member2) = setup_group(&env, &client, &token);

    // Neither member has set preferences
    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 - 3_600;
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    assert_eq!(reminded.len(), 0);
}

#[test]
fn test_no_reminder_after_contribution() {
    let (env, client, _creator_unused, token) = setup_test();
    let (group_id, creator, member2) = setup_group(&env, &client, &token);

    // Both members set preferences with a large threshold so they're always in range
    client.set_notification_preferences(&creator, &true, &168u64, &true, &true);
    client.set_notification_preferences(&member2, &true, &168u64, &true, &true);

    // Fund member2 so they can contribute
    let sac = token::StellarAssetClient::new(&env, &token);
    sac.mint(&member2, &500_000_000i128);

    // member2 contributes
    client.contribute(&member2, &group_id);

    // Advance into threshold window
    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 - 3_600;
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    // Only creator should be reminded; member2 already contributed
    assert_eq!(reminded.len(), 1);
    assert_eq!(reminded.get(0).unwrap(), creator);
}

#[test]
fn test_trigger_reminders_group_not_found() {
    let (_env, client, _, _token) = setup_test();

    let result = client.try_trigger_contribution_reminders(&999u64);
    assert_eq!(result, Err(Ok(AjoError::GroupNotFound)));
}

#[test]
fn test_no_grace_reminder_when_grace_disabled() {
    let (env, client, token, _) = setup_test();
    let (group_id, _creator, member2) = setup_group(&env, &client, &token);

    // member2 opts in but disables grace period reminders
    client.set_notification_preferences(&member2, &true, &24u64, &false, &true);

    // Advance into grace period (but grace reminders disabled for member2)
    env.ledger().with_mut(|li| {
        li.timestamp += 604_800 + 3_600;
    });

    let reminded = client.trigger_contribution_reminders(&group_id);
    // member2 disabled grace_period_reminders, so no reminder in grace window
    assert_eq!(reminded.len(), 0);
}

#[test]
fn test_get_reminder_history_not_found() {
    let (env, client, _, _token) = setup_test();
    let member = Address::generate(&env);

    let result = client.try_get_reminder_history(&1u64, &1u32, &member);
    assert_eq!(result, Err(Ok(AjoError::GroupNotFound)));
}
