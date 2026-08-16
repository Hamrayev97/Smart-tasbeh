import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const RAMADAN_HIJRI_MONTH = 9;
const PRAYER_IDS_KEY = 'prayerNotificationIds';
const ENGAGEMENT_IDS_KEY = 'engagementNotificationIds';

export const getNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

// Prayer-time and daily-engagement reminders are scheduled independently, so
// each tracks its own notification IDs in storage and only cancels its own —
// turning one off must not silently wipe out the other.
const cancelTracked = async (storageKey) => {
  const raw = await AsyncStorage.getItem(storageKey);
  const ids = raw ? JSON.parse(raw) : [];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => null)));
  await AsyncStorage.removeItem(storageKey);
};

export const cancelPrayerNotifications = async () => cancelTracked(PRAYER_IDS_KEY);
export const cancelEngagementReminders = async () => cancelTracked(ENGAGEMENT_IDS_KEY);

// timings: raw Aladhan strings like "04:12 (+05)". labels: { Fajr: 'Bomdod', ... }.
// Re-schedules all five as repeating daily local notifications at that hour:minute;
// call again whenever fresh timings are fetched so the times keep pace with the season.
export const schedulePrayerNotifications = async ({ timings, hijri, labels, bodyTemplate }) => {
  await cancelPrayerNotifications();
  const isRamadan = hijri?.month?.number === RAMADAN_HIJRI_MONTH;
  const ids = [];

  for (const key of PRAYER_KEYS) {
    const raw = timings?.[key];
    if (!raw) continue;
    const clean = raw.split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;

    let title = labels.names[key] || key;
    if (isRamadan && key === 'Fajr') title = labels.suhoor;
    if (isRamadan && key === 'Maghrib') title = labels.iftar;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: bodyTemplate.replace('{time}', clean),
      },
      trigger: { hour: h, minute: m, repeats: true },
    });
    ids.push(id);
  }

  await AsyncStorage.setItem(PRAYER_IDS_KEY, JSON.stringify(ids));
};

// "Come back and do dhikr" reminders. Rather than a plain repeating daily
// notification (which fires whether or not the user already opened the app
// that day), these are one-shot notifications for the next occurrence of
// each hour in `hours`. The caller re-invokes this every time the app is
// opened/resumed, which cancels the previous ones and schedules fresh ones
// further out — so a reminder only actually reaches the user if the app
// really has stayed unopened until that time.
export const scheduleEngagementReminders = async ({ title, body, hours = [10, 20] }) => {
  await cancelEngagementReminders();
  const now = new Date();
  const ids = [];

  for (const hour of hours) {
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: next,
    });
    ids.push(id);
  }

  await AsyncStorage.setItem(ENGAGEMENT_IDS_KEY, JSON.stringify(ids));
};
