import React from 'react';
import { View, Text } from 'react-native';

export default function GoalProgress({ current, target, colors, t, goalReached }) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={{ marginTop: 10, backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: goalReached ? colors.primary : colors.border }}>
      {goalReached && (
        <Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center', marginBottom: 4, fontSize: 13 }}>
          {t.goalReached}
        </Text>
      )}
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{t.goal}: {target}</Text>
      <View style={{ marginTop: 6, height: 8, borderRadius: 8, backgroundColor: colors.border, overflow: 'hidden' }}>
        <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: colors.primary }} />
      </View>
    </View>
  );
}
