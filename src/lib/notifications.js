import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const RAMADAN_HIJRI_MONTH = 9;

export const getNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

export const cancelPrayerNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// timings: raw Aladhan strings like "04:12 (+05)". labels: { Fajr: 'Bomdod', ... }.
// Re-schedules all five as repeating daily local notifications at that hour:minute;
// call again whenever fresh timings are fetched so the times keep pace with the season.
export const schedulePrayerNotifications = async ({ timings, hijri, labels, bodyTemplate }) => {
  await cancelPrayerNotifications();
  const isRamadan = hijri?.month?.number === RAMADAN_HIJRI_MONTH;

  for (const key of PRAYER_KEYS) {
    const raw = timings?.[key];
    if (!raw) continue;
    const clean = raw.split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;

    let title = labels.names[key] || key;
    if (isRamadan && key === 'Fajr') title = labels.suhoor;
    if (isRamadan && key === 'Maghrib') title = labels.iftar;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: bodyTemplate.replace('{time}', clean),
      },
      trigger: { hour: h, minute: m, repeats: true },
    });
  }
};
