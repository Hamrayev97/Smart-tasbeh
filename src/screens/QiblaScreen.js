import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;
const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

const calculateQiblaBearing = (lat, lon) => {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LON - lon);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const nextPrayerKey = (timings) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const key of PRAYER_KEYS) {
    const [h, m] = timings[key].split(':').map(Number);
    if (h * 60 + m > nowMinutes) return key;
  }
  return PRAYER_KEYS[0];
};

export default function QiblaScreen() {
  const { t, colors, theme } = useApp();
  const [status, setStatus] = useState('loading'); // loading | denied | error | ready
  const [coords, setCoords] = useState(null);
  const [heading, setHeading] = useState(null);
  const [timings, setTimings] = useState(null);
  const headingSubRef = useRef(null);

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
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&method=2`
        );
        const json = await response.json();
        if (!mounted) return;
        if (!json?.data?.timings) throw new Error('No timings in response');
        setTimings(json.data.timings);
        setStatus('ready');
      } catch (e) {
        if (mounted) setStatus('error');
      }
    })();

    if (Platform.OS !== 'web') {
      Location.watchHeadingAsync((h) => setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading))
        .then((sub) => {
          headingSubRef.current = sub;
        })
        .catch(() => null);
    }

    return () => {
      mounted = false;
      headingSubRef.current?.remove();
    };
  }, []);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 }}>
        <Ionicons name="location-outline" size={40} color={colors.textMuted} />
        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '600', marginTop: 12 }}>
          {status === 'denied' ? t.locationDenied : t.locationError}
        </Text>
      </View>
    );
  }

  const qiblaBearing = coords ? calculateQiblaBearing(coords.latitude, coords.longitude) : null;
  const needleRotation = qiblaBearing !== null ? qiblaBearing - (heading || 0) : 0;
  const next = timings ? nextPrayerKey(timings) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
      <View
        style={{
          width: 220,
          height: 220,
          borderRadius: 110,
          borderWidth: 3,
          borderColor: theme.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ transform: [{ rotate: `${needleRotation}deg` }] }}>
          <Ionicons name="navigate" size={90} color={theme.primary} />
        </View>
      </View>
      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 16, fontSize: 16 }}>
        {t.qibla}: {qiblaBearing !== null ? `${Math.round(qiblaBearing)}°` : '—'}
      </Text>
      {Platform.OS === 'web' && (
        <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 12, textAlign: 'center' }}>{t.qiblaWebNote}</Text>
      )}

      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 28, alignSelf: 'flex-start' }}>{t.prayerTimes}</Text>
      <View style={{ width: '100%', marginTop: 10 }}>
        {timings &&
          PRAYER_KEYS.map((key) => (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: key === next ? theme.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: key === next ? '#fff' : colors.text, fontWeight: '600' }}>{t[key.toLowerCase()] || key}</Text>
              <Text style={{ color: key === next ? '#fff' : colors.text, fontWeight: '700' }}>{timings[key]}</Text>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}
