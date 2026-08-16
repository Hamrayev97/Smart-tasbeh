import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

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

  const fetchTimings = useCallback(async () => {
    setStatus('loading');
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!mountedRef.current) return;
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      // method=3: Muslim World League. school=1: Hanafi Asr timing (later Asr),
      // the convention followed in Uzbekistan and most of Central Asia.
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&method=3&school=1`
      );
      const json = await response.json();
      if (!mountedRef.current) return;
      if (!json?.data?.timings) throw new Error('No timings in response');
      setTimings(json.data.timings);
      setHijri(json.data.date?.hijri || null);
      setStatus('ready');
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
