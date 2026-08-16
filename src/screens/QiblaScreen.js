import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import usePrayerTimes from '../hooks/usePrayerTimes';
import LocationPermissionGate from '../components/LocationPermissionGate';

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
  const { status, coords, timings, requestPermission } = usePrayerTimes();
  const [heading, setHeading] = useState(null);
  const headingSubRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Location.watchHeadingAsync((h) => setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading))
        .then((sub) => {
          headingSubRef.current = sub;
        })
        .catch(() => null);
    }
    return () => headingSubRef.current?.remove();
  }, []);

  if (status !== 'ready') {
    return <LocationPermissionGate status={status} requestPermission={requestPermission} />;
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
