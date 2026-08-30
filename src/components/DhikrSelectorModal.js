import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Manba: zikr.islom.uz — Tonggi zikrlar
const RECOMMENDED_DHIKRS = [
  { name: 'Oyatul Kursiy', arabic: 'اللَّهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', source: 'Baqara 2:255', target: 1 },
  { name: 'Ixlos surasi', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Falaq surasi', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Naas surasi', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Sayyidul istig\'for', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ', source: 'Imom Buxoriy', target: 1 },
  { name: 'Tonggi zikr', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا', source: 'Abu Dovud', target: 1 },
  { name: 'Tavakkul duosi', arabic: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ', source: 'Ibn Sunniy', target: 7 },
  { name: 'Bismilohi himoyasi', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'SubhanAllahi wa bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ', source: 'Imom Muslim', target: 3 },
  { name: 'Badan himoyasi', arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', source: 'Abu Dovud', target: 3 },
  { name: 'Ofiyat so\'rash', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', source: 'Abu Dovud, Nasaiy', target: 1 },
  { name: 'Yomonlikdan panoh', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', source: 'Muslim, Ahmad', target: 3 },
  { name: 'Salovot', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', source: 'Tabaroniy', target: 10 },
  { name: 'Istig\'for', arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', source: 'Ibn Sunniy', target: 3 },
  { name: 'Iymon kalimasi', arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', source: 'Buxoriy, Muslim', target: 10 },
  { name: 'Ya Hayyul Qayyum', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', source: 'Ibn Sunniy', target: 1 },
  { name: 'To\'rt kalima', arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', source: 'Imom Muslim', target: 33 },
  { name: 'Ilm va rizq duosi', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا', source: 'Ibn Moja', target: 1 },
  { name: 'Ulug\' tasbeh', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', source: 'Imom Muslim', target: 100 },
  { name: 'G\'am va qarzdan panoh', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', source: 'Abu Dovud', target: 1 },
  { name: 'Ne\'matga shukr', arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ', source: 'Abu Dovud', target: 1 },
  { name: 'Tonggi duo', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', source: 'Tirmiziy', target: 1 },
  { name: 'Islom fitrasi', arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَكَلِمَةِ الْإِخْلَاصِ', source: 'Ibn Sunniy', target: 1 },
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللّٰهِ', source: 'Muslim', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلّٰهِ', source: 'Muslim', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللّٰهُ أَكْبَرُ', source: 'Muslim', target: 33 },
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
                    {rec.source && (
                      <Text style={{ fontSize: 11, color: theme.primary, textAlign: 'center', marginTop: 2, fontStyle: 'italic' }}>
                        {rec.source} {rec.target > 1 ? `• ${rec.target}x` : ''}
                      </Text>
                    )}
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
