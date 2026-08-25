import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { fetchTodayTimings } from '../lib/fetchPrayerTimings';
import { schedulePrayerNotifications } from '../lib/notifications';
import { useApp } from './useAppContext';

// Shared by QiblaScreen (Qibla bearing + prayer list) and RamadanScreen
// (Suhoor/Iftar times + Hijri date), so the location + Aladhan fetch only happens once per screen.
//
// status: checking (looking up existing permission) | prompt (need to explain + ask)
//       | denied (user said no) | loading (fetching) | error | ready
export default function usePrayerTimes() {
  const [status, setStatus] = useState('checking');
  const [coords, setCoords] = useState(null);
  const [timings, setTimings] = useState(null);
  const [hijri, setHijri] = useState(null);
  const mountedRef = useRef(true);
  const { t, notificationsOn } = useApp();
  // Read via refs inside fetchTimings so language/notification-toggle changes
  // don't change fetchTimings's identity and re-trigger the mount-time fetch.
  const latestRef = useRef({ t, notificationsOn });
  latestRef.current = { t, notificationsOn };

  const fetchTimings = useCallback(async () => {
    setStatus('loading');
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (!mountedRef.current) return;
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });

      const { timings: freshTimings, hijri: freshHijri } = await fetchTodayTimings(position.coords);
      if (!mountedRef.current) return;
      setTimings(freshTimings);
      setHijri(freshHijri);
      setStatus('ready');

      // Re-sync the scheduled reminders to today's exact times whenever we
      // have a fresh fetch, so they stay accurate as prayer times shift.
      const { t: latestT, notificationsOn: latestNotificationsOn } = latestRef.current;
      if (latestNotificationsOn) {
        schedulePrayerNotifications({
          timings: freshTimings,
          hijri: freshHijri,
          labels: {
            names: { Fajr: latestT.fajr, Dhuhr: latestT.dhuhr, Asr: latestT.asr, Maghrib: latestT.maghrib, Isha: latestT.isha },
            suhoor: latestT.suhoorEnds,
            iftar: latestT.iftarTime,
          },
          bodyTemplate: latestT.prayerReminderBody,
        }).catch(() => null);
      }
    } catch (e) {
      if (mountedRef.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      const { status: existing } = await Location.getForegroundPermissionsAsync();
      if (!mountedRef.current) return;
      if (existing === 'granted') fetchTimings();
      else setStatus('prompt');
    })();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTimings]);

  const requestPermission = useCallback(async () => {
    const { status: result } = await Location.requestForegroundPermissionsAsync();
    if (!mountedRef.current) return;
    if (result === 'granted') fetchTimings();
    else setStatus('denied');
  }, [fetchTimings]);

  return { status, coords, timings, hijri, requestPermission };
}
