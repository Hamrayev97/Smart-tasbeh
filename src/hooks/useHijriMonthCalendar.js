import { useEffect, useState } from 'react';

// Fetches a full Hijri-calendar month (e.g. all of Ramadan) of prayer timings
// in one request, keyed to the same coordinates/method as usePrayerTimes.
export default function useHijriMonthCalendar(coords, hijriYear, hijriMonth) {
  const [days, setDays] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error | ready

  useEffect(() => {
    if (!coords || !hijriYear || !hijriMonth) return;
    let mounted = true;
    setStatus('loading');

    fetch(
      `https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/${hijriMonth}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=3&school=1`
    )
      .then((response) => response.json())
      .then((json) => {
        if (!mounted) return;
        if (!Array.isArray(json?.data)) throw new Error('Unexpected calendar response');
        setDays(json.data);
        setStatus('ready');
      })
      .catch(() => {
        if (mounted) setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, [coords, hijriYear, hijriMonth]);

  return { days, status };
}
