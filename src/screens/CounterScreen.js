import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useApp } from '../hooks/useAppContext';
import GoalProgress from '../components/GoalProgress';

export default function CounterScreen() {
  const { loading, t, colors, theme, selectedDhikr, dhikrs, setSelectedDhikrId, increment, resetCurrent, stats } = useApp();

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t.currentDhikr}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        {dhikrs.map((dhikr) => (
          <Pressable
            key={dhikr.id}
            onPress={() => setSelectedDhikrId(dhikr.id)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: selectedDhikr?.id === dhikr.id ? theme.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedDhikr?.id === dhikr.id ? theme.primary : colors.border,
            }}
          >
            <Text style={{ color: selectedDhikr?.id === dhikr.id ? '#fff' : colors.text, fontWeight: '600' }}>{dhikr.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <Pressable
          onPress={increment}
          style={{ width: 220, height: 220, borderRadius: 120, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}
        >
          <Text style={{ color: '#fff', fontSize: 56, fontWeight: '800' }}>{selectedDhikr?.current_count || 0}</Text>
          <Text style={{ color: '#d8fff3', fontWeight: '700' }}>{t.increment}</Text>
        </Pressable>
      </View>

      <Pressable onPress={resetCurrent} style={{ alignSelf: 'center', backgroundColor: theme.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}>
        <Text style={{ color: '#2e2814', fontWeight: '700' }}>{t.reset}</Text>
      </Pressable>

      <Text style={{ marginTop: 18, color: colors.textMuted, textAlign: 'center' }}>{t.dailyCount}: <Text style={{ color: colors.text, fontWeight: '700' }}>{stats.today}</Text></Text>

      <GoalProgress current={selectedDhikr?.current_count || 0} target={selectedDhikr?.target || 33} colors={colors} t={t} />
    </ScrollView>
  );
}
