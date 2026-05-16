import * as Notifications from 'expo-notifications';

const TRIAL_REMINDER_ID = 'tonekid.trial.reminder';
const TRIAL_BILLING_ID = 'tonekid.trial.billing';

const DAY_MS = 24 * 60 * 60 * 1000;

async function ensurePermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === 'granted') return true;
    if (existing.status === 'denied') return false;
    const result = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return result.status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelTrialNotifications(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID);
  } catch {
    // ignore — identifier may not exist
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(TRIAL_BILLING_ID);
  } catch {
    // ignore
  }
}

/**
 * Schedule the two trial-related local notifications that the paywall promises:
 * - "In 1 Day" reminder that the free trial is ending soon.
 * - "In 3 Days" billing notice when the trial ends and the subscription kicks in.
 *
 * Safe to call multiple times — previous schedules with the same id are replaced.
 */
export async function scheduleTrialNotifications(): Promise<void> {
  const ok = await ensurePermission();
  if (!ok) return;

  await cancelTrialNotifications();

  const now = Date.now();
  const reminderAt = new Date(now + 2 * DAY_MS); // 2 days after subscribe = 1 day before billing
  const billingAt = new Date(now + 3 * DAY_MS); // 3 days after subscribe = trial ends

  const billingDateLabel = billingAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: TRIAL_REMINDER_ID,
      content: {
        title: 'Your ToneKid trial ends tomorrow',
        body: `You'll be charged on ${billingDateLabel} unless you cancel before then.`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderAt,
      },
    });
  } catch {
    // ignore — scheduling can fail on unsupported platforms / simulators
  }

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: TRIAL_BILLING_ID,
      content: {
        title: 'ToneKid Pro is now active',
        body: 'Your free trial just ended. Welcome to unlimited tone matching.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: billingAt,
      },
    });
  } catch {
    // ignore
  }
}
