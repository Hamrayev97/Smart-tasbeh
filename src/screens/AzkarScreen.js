import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useApp } from '../hooks/useAppContext';
import azkarData from '../data/azkar.json';

const MORNING = 1;
const EVENING = 2;
const BOTH = 0;

export default function AzkarScreen() {
  const { t, colors, theme } = useApp();
  const [tab, setTab] = useState(MORNING);

  const items = azkarData
    .filter((item) => item.type === BOTH || item.type === tab)
    .sort((a, b) => a.order - b.order);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', padding: 16, paddingBottom: 0 }}>
        {[
          { key: MORNING, label: t.morningAzkar },
          { key: EVENING, label: t.eveningAzkar },
        ].map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setTab(opt.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              marginRight: opt.key === MORNING ? 8 : 0,
              alignItems: 'center',
              backgroundColor: tab === opt.key ? theme.primary : colors.surface,
              borderWidth: 1,
              borderColor: tab === opt.key ? theme.primary : colors.border,
            }}
          >
            <Text style={{ color: tab === opt.key ? '#fff' : colors.text, fontWeight: '700' }}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.order)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontSize: 20, textAlign: 'right', lineHeight: 34 }}>{item.content}</Text>
            {!!item.transliteration && (
              <Text style={{ color: colors.textMuted, fontStyle: 'italic', marginTop: 10 }}>{item.transliteration}</Text>
            )}
            {!!item.translation && <Text style={{ color: colors.text, marginTop: 8 }}>{item.translation}</Text>}
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: theme.primary,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{item.countDescription || item.count}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
