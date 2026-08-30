import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RECOMMENDED_DHIKRS = [
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللّٰهِ', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلّٰهِ', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللّٰهُ أَكْبَرُ', target: 33 },
  { name: 'La ilaha illallah', arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', target: 100 },
  { name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللّٰهَ', target: 100 },
  { name: 'SubhanAllahi wa bihamdihi', arabic: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ', target: 100 },
  { name: 'SubhanAllahil Azim', arabic: 'سُبْحَانَ اللّٰهِ الْعَظِيمِ', target: 100 },
  { name: 'La hawla wa la quwwata illa billah', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', target: 33 },
  { name: 'Hasbunallahu wa ni\'mal wakil', arabic: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ', target: 33 },
  { name: 'Salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَآلِ مُحَمَّدٍ', target: 100 },
  { name: 'Subboohun Quddus', arabic: 'سُبُّوحٌ قُدُّوسٌ رَبُّ الْمَلَائِكَةِ وَالرُّوحِ', target: 33 },
  { name: 'Rabbi zidni ilma', arabic: 'رَبِّ زِدْنِي عِلْمًا', target: 33 },
  { name: 'Rabbana atina fid-dunya', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', target: 33 },
  { name: 'La ilaha illa anta subhanaka', arabic: 'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', target: 33 },
  { name: 'Rabbighfir li', arabic: 'رَبِّ اغْفِرْ لِي', target: 100 },
  { name: 'Ya Hayyu Ya Qayyum', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', target: 33 },
  { name: 'Allahumma innaka afuwwun', arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', target: 33 },
  { name: 'Bismillah', arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ', target: 100 },
];

export default function DhikrSelectorModal({ visible, onClose, dhikrs, selectedId, onSelect, onAdd, theme, colors, t }) {
  const existingNames = useMemo(() => new Set(dhikrs.map((d) => d.name.toLowerCase())), [dhikrs]);

  const recommendations = useMemo(
    () => RECOMMENDED_DHIKRS.filter((r) => !existingNames.has(r.name.toLowerCase())),
    [existingNames],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            paddingBottom: 34,
          }}
        >
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 16 }}>
            {t.selectDhikr || t.currentDhikr}
          </Text>

          <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
            {dhikrs.map((dhikr) => {
              const isSelected = dhikr.id === selectedId;
              return (
                <Pressable
                  key={dhikr.id}
                  onPress={() => { onSelect(dhikr.id); onClose(); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isSelected ? theme.primary + '18' : colors.surface,
                    borderWidth: 1.5,
                    borderColor: isSelected ? theme.primary : colors.border,
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 8,
                  }}
                >
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isSelected ? theme.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{dhikr.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: isSelected ? theme.primary : colors.textMuted }}>{dhikr.current_count}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>/ {dhikr.target}</Text>
                  </View>
                </Pressable>
              );
            })}

            {recommendations.length > 0 && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 12 }}>
                  <Ionicons name="sparkles" size={16} color={theme.primary} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.primary, marginLeft: 6 }}>
                    {t.recommendedDhikrs || 'Recommended'}
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.border, marginLeft: 10 }} />
                </View>

                {recommendations.map((rec) => (
                  <View
                    key={rec.name}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, textAlign: 'center', lineHeight: 32 }}>
                      {rec.arabic}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>
                      {rec.name}
                    </Text>
                    <Pressable
                      onPress={() => onAdd({ name: rec.name, target: rec.target })}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.primary,
                        borderRadius: 12,
                        paddingVertical: 8,
                        marginTop: 10,
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>
                        {t.addDhikr}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
