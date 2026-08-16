// Shared Aladhan "today" fetch, used by usePrayerTimes (Qibla/Ramadan screens)
// and the notification-reminder scheduler so both build the request the same way.
// method=3: Muslim World League. school=1: Hanafi Asr timing (later Asr),
// the convention followed in Uzbekistan and most of Central Asia.
export async function fetchTodayTimings(coords) {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=3&school=1`
  );
  const json = await response.json();
  if (!json?.data?.timings) throw new Error('No timings in response');
  return { timings: json.data.timings, hijri: json.data.date?.hijri || null };
}
