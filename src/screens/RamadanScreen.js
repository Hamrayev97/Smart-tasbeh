import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import usePrayerTimes from '../hooks/usePrayerTimes';
import LocationPermissionGate from '../components/LocationPermissionGate';
import { getFastingDay, getFastingDaysCount, setFastingDay } from '../db/database';

const RAMADAN_HIJRI_MONTH = 9;

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function RamadanScreen() {
  const { t, colors, theme } = useApp();
  const { status, timings, hijri, requestPermission } = usePrayerTimes();
  const [fastedToday, setFastedToday] = useState(false);
  const [fastCount, setFastCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [fasted, count] = await Promise.all([getFastingDay(todayKey()), getFastingDaysCount()]);
      if (mounted) {
        setFastedToday(fasted);
        setFastCount(count);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFasted = async () => {
    const next = !fastedToday;
    setFastedToday(next);
    await setFastingDay(todayKey(), next);
    setFastCount(await getFastingDaysCount());
  };

  if (status !== 'ready') {
    return <LocationPermissionGate status={status} requestPermission={requestPermission} />;
  }

  const isRamadan = hijri?.month?.number === RAMADAN_HIJRI_MONTH;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
      <Ionicons name="moon" size={40} color={theme.primary} />
      {hijri && (
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>
          {hijri.day} {hijri.month?.en} {hijri.year}
        </Text>
      )}

      {isRamadan ? (
        <>
          <View style={{ backgroundColor: theme.primary, borderRadius: 16, padding: 18, marginTop: 16, width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>
              {t.ramadanDay} {hijri.day}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', width: '100%', marginTop: 16 }}>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginRight: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.suhoorEnds}</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20, marginTop: 6 }}>{timings.Fajr}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginLeft: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.iftarTime}</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20, marginTop: 6 }}>{timings.Maghrib}</Text>
            </View>
          </View>

          <Pressable
            onPress={toggleFasted}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: fastedToday ? theme.primary : colors.surface,
              borderWidth: 1,
              borderColor: fastedToday ? theme.primary : colors.border,
              borderRadius: 14,
              padding: 16,
              marginTop: 20,
              width: '100%',
            }}
          >
            <Ionicons name={fastedToday ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={fastedToday ? '#fff' : colors.text} />
            <Text style={{ color: fastedToday ? '#fff' : colors.text, fontWeight: '700', marginLeft: 8 }}>
              {fastedToday ? t.fastedToday : t.markFastedToday}
            </Text>
          </Pressable>

          <Text style={{ color: colors.textMuted, marginTop: 14 }}>
            {t.fastingDaysCount}: <Text style={{ color: colors.text, fontWeight: '700' }}>{fastCount}</Text>
          </Text>
        </>
      ) : (
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>{t.notRamadan}</Text>
      )}
    </ScrollView>
  );
}
