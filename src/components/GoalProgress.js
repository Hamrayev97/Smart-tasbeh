import React from 'react';
import { View, Text } from 'react-native';

export default function GoalProgress({ current, target, colors, t, goalReached }) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const percentage = Math.round(progress * 100);
  const remaining = Math.max(target - current, 0);

  return (
    <View style={{ marginTop: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: goalReached ? colors.primary : colors.border }}>
      {goalReached && (
        <Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center', marginBottom: 6, fontSize: 14 }}>
          {t.goalReached}
        </Text>
      )}
      <Text style={{ color: colors.text, fontWeight: '700' }}>{t.goal}: {target}</Text>
      <View style={{ marginTop: 8, height: 10, borderRadius: 10, backgroundColor: colors.border, overflow: 'hidden' }}>
        <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: colors.primary }} />
      </View>
      <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>{t.percentage}: {percentage}% • {t.remaining}: {remaining}</Text>
    </View>
  );
}
