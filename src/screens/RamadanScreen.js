import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import usePrayerTimes from '../hooks/usePrayerTimes';
import useHijriMonthCalendar from '../hooks/useHijriMonthCalendar';
import LocationPermissionGate from '../components/LocationPermissionGate';
import { getAllFastingDates, setFastingDay } from '../db/database';

const RAMADAN_HIJRI_MONTH = 9;

const todayKey = () => new Date().toISOString().slice(0, 10);
const formatTime = (t) => (t ? t.split(' ')[0] : '');
// Aladhan's calendar returns Gregorian dates as "DD-MM-YYYY"; our FastingDays
// table keys on "YYYY-MM-DD" (same shape as todayKey()).
const gregorianToDateKey = (gregorianDate) => {
  const [d, m, y] = gregorianDate.split('-');
  return `${y}-${m}-${d}`;
};

export default function RamadanScreen() {
  const { t, colors, theme } = useApp();
  const { status, coords, timings, hijri, requestPermission } = usePrayerTimes();
  const isRamadan = hijri?.month?.number === RAMADAN_HIJRI_MONTH;
  const { days: monthDays } = useHijriMonthCalendar(
    isRamadan ? coords : null,
    hijri?.year,
    hijri?.month?.number
  );
  const [fastedDates, setFastedDates] = useState(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const dates = await getAllFastingDates();
      if (mounted) setFastedDates(new Set(dates));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFastedDate = async (date) => {
    const next = !fastedDates.has(date);
    await setFastingDay(date, next);
    setFastedDates((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(date);
      else updated.delete(date);
      return updated;
    });
  };

  if (status !== 'ready') {
    return <LocationPermissionGate status={status} requestPermission={requestPermission} />;
  }

  const fastedToday = fastedDates.has(todayKey());

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
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20, marginTop: 6 }}>{formatTime(timings.Fajr)}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginLeft: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.iftarTime}</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20, marginTop: 6 }}>{formatTime(timings.Maghrib)}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => toggleFastedDate(todayKey())}
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
            {t.fastingDaysCount}: <Text style={{ color: colors.text, fontWeight: '700' }}>{fastedDates.size}</Text>
          </Text>

          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 28, alignSelf: 'flex-start' }}>{t.monthlyCalendar}</Text>
          <View style={{ width: '100%', marginTop: 10 }}>
            {monthDays?.map((day) => {
              const dateKey = gregorianToDateKey(day.date.gregorian.date);
              const isToday = dateKey === todayKey();
              const fasted = fastedDates.has(dateKey);
              return (
                <Pressable
                  key={dateKey}
                  onPress={() => toggleFastedDate(dateKey)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isToday ? theme.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isToday ? theme.primary : colors.border,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ width: 28, color: isToday ? '#fff' : colors.text, fontWeight: '700' }}>{day.date.hijri.day}</Text>
                  <Text style={{ flex: 1, color: isToday ? '#fff' : colors.textMuted, fontSize: 12 }}>{day.date.gregorian.date}</Text>
                  <Text style={{ color: isToday ? '#fff' : colors.text, fontSize: 12, width: 48, textAlign: 'center' }}>{formatTime(day.timings.Fajr)}</Text>
                  <Text style={{ color: isToday ? '#fff' : colors.text, fontSize: 12, width: 48, textAlign: 'center' }}>{formatTime(day.timings.Maghrib)}</Text>
                  <Ionicons
                    name={fasted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={fasted ? (isToday ? '#fff' : theme.primary) : isToday ? '#ffffffaa' : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>{t.notRamadan}</Text>
      )}
    </ScrollView>
  );
}
