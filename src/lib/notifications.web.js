// Repeating background local notifications aren't reliable in a browser tab
// (no OS-level scheduler once the tab/site is closed), so the reminder feature
// is native-only. The Settings screen shows a note instead of the toggle on web.
export const getNotificationPermission = async () => 'undetermined';
export const requestNotificationPermission = async () => 'denied';
export const cancelPrayerNotifications = async () => {};
export const schedulePrayerNotifications = async () => {};
export const cancelEngagementReminders = async () => {};
export const scheduleEngagementReminders = async () => {};
