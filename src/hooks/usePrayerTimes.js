import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Shared by QiblaScreen (Qibla bearing + prayer list) and RamadanScreen
// (Suhoor/Iftar times + Hijri date), so the location + Aladhan fetch only happens once per screen.
export default function usePrayerTimes() {
  const [status, setStatus] = useState('loading'); // loading | denied | error | ready
  const [coords, setCoords] = useState(null);
  const [timings, setTimings] = useState(null);
  const [hijri, setHijri] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted) return;
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
        // method=3: Muslim World League. school=1: Hanafi Asr timing (later Asr),
        // the convention followed in Uzbekistan and most of Central Asia.
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&method=3&school=1`
        );
        const json = await response.json();
        if (!mounted) return;
        if (!json?.data?.timings) throw new Error('No timings in response');
        setTimings(json.data.timings);
        setHijri(json.data.date?.hijri || null);
        setStatus('ready');
      } catch (e) {
        if (mounted) setStatus('error');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { status, coords, timings, hijri };
}
