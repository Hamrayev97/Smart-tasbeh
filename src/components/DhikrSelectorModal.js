import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ARABIC_LANGS = new Set(['ar', 'ur']);

// Manba: zikr.islom.uz
const MORNING_DHIKRS = [
  { name: 'Oyatul Kursiy', arabic: 'اللَّهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', latin: 'Allohu laa ilaaha illaa Huwal Hayyul Qayyuum', source: 'Baqara 2:255', target: 1 },
  { name: 'Ixlos surasi', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', latin: 'Qul Huwallohu Ahad', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Falaq surasi', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', latin: 'Qul a\'uuzu bi Rabbil falaq', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Naas surasi', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', latin: 'Qul a\'uuzu bi Rabbin naas', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Sayyidul istig\'for', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ', latin: 'Allohumma Anta Rabbiy laa ilaaha illaa Anta', source: 'Imom Buxoriy', target: 1 },
  { name: 'Tonggi zikr', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا', latin: 'Rodiitu billaahi Robban wa bil Islaami diinan wa bi Muhammadin Nabiyyan', source: 'Abu Dovud', target: 1 },
  { name: 'Tavakkul duosi', arabic: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ', latin: 'Hasbiyallohu laa ilaaha illaa Huwa \'alayhi tavakkaltu', source: 'Ibn Sunniy', target: 7 },
  { name: 'Bismilohi himoyasi', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', latin: 'Bismillahillazii laa yadurru ma\'asmihi shay\'un', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'SubhanAllahi wa bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ', latin: 'Subhaanallohi wa bihamdihi \'adada xolqihi', source: 'Imom Muslim', target: 3 },
  { name: 'Badan himoyasi', arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', latin: 'Allohumma \'aafinii fii badanii, Allohumma \'aafinii fii sam\'ii, Allohumma \'aafinii fii basarii', source: 'Abu Dovud', target: 3 },
  { name: 'Ofiyat so\'rash', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', latin: 'Allohumma innii as\'alukal \'aafiyata fid dunyaa wal aaxiroh', source: 'Abu Dovud, Nasaiy', target: 1 },
  { name: 'Yomonlikdan panoh', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', latin: 'A\'uuzu bi kalimaatillahit taammaati min sharri maa xolaq', source: 'Muslim, Ahmad', target: 3 },
  { name: 'Salovot', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', latin: 'Allohumma solli \'alaa Muhammadin wa \'alaa aali Muhammad', source: 'Tabaroniy', target: 10 },
  { name: 'Istig\'for', arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', latin: 'Astag\'firullohallazii laa ilaaha illaa Huwal Hayyul Qayyuumu wa atuubu ilayh', source: 'Ibn Sunniy', target: 3 },
  { name: 'Iymon kalimasi', arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', latin: 'Laa ilaaha illallohu wahdahu laa shariika lah', source: 'Buxoriy, Muslim', target: 10 },
  { name: 'Ya Hayyul Qayyum', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', latin: 'Yaa Hayyu yaa Qayyuumu bi rohmatika astag\'iis', source: 'Ibn Sunniy', target: 1 },
  { name: 'To\'rt kalima', arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', latin: 'Subhaanallohi wal hamdu lillaahi wa laa ilaaha illallohu wallohu Akbar', source: 'Imom Muslim', target: 33 },
  { name: 'Ilm va rizq duosi', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا', latin: 'Allohumma innii as\'aluka \'ilman naafi\'an wa rizqon tayyiban', source: 'Ibn Moja', target: 1 },
  { name: 'Ulug\' tasbeh', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', latin: 'Subhaanallohi wa bihamdihi Subhaanallohil \'Aziim', source: 'Imom Muslim', target: 100 },
  { name: 'G\'am va qarzdan panoh', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', latin: 'Allohumma innii a\'uuzu bika minal hammi wal hazan', source: 'Abu Dovud', target: 1 },
  { name: 'Ne\'matga shukr', arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ', latin: 'Allohumma maa asbaha bii min ni\'matin faminka wahdak', source: 'Abu Dovud', target: 1 },
  { name: 'Tonggi duo', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', latin: 'Allohumma bika asbahnaa wa bika amsaynaa', source: 'Tirmiziy', target: 1 },
  { name: 'Islom fitrasi', arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَكَلِمَةِ الْإِخْلَاصِ', latin: 'Asbahnaa \'alaa fitrotil Islaami wa kalimatil ixloos', source: 'Ibn Sunniy', target: 1 },
];

const EVENING_DHIKRS = [
  { name: 'Oyatul Kursiy (kechki)', arabic: 'اللَّهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', latin: 'Allohu laa ilaaha illaa Huwal Hayyul Qayyuum', source: 'Baqara 2:255', target: 1 },
  { name: 'Ixlos surasi (kechki)', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', latin: 'Qul Huwallohu Ahad', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Falaq surasi (kechki)', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', latin: 'Qul a\'uuzu bi Rabbil falaq', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Naas surasi (kechki)', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', latin: 'Qul a\'uuzu bi Rabbin naas', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Kechki zikr', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا', latin: 'Rodiitu billaahi Robban wa bil Islaami diinan wa bi Muhammadin Nabiyyan', source: 'Abu Dovud', target: 1 },
  { name: 'Kechki duo', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا', latin: 'Allohumma bika amsaynaa wa bika asbahnaa', source: 'Tirmiziy', target: 1 },
  { name: 'Kechki fitrat', arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَكَلِمَةِ الْإِخْلَاصِ', latin: 'Amsaynaa \'alaa fitrotil Islaami wa kalimatil ixloos', source: 'Ibn Sunniy', target: 1 },
  { name: 'Kechki ne\'mat', arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ', latin: 'Allohumma maa amsaa bii min ni\'matin faminka wahdak', source: 'Abu Dovud', target: 1 },
  { name: 'Kechki guvohlik', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', latin: 'Amsaynaa wa amsal mulku lillaah', source: 'Abu Dovud', target: 1 },
  { name: 'Tavakkul duosi (kechki)', arabic: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ', latin: 'Hasbiyallohu laa ilaaha illaa Huwa \'alayhi tavakkaltu', source: 'Ibn Sunniy', target: 7 },
  { name: 'Bismilohi himoyasi (kechki)', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', latin: 'Bismillahillazii laa yadurru ma\'asmihi shay\'un', source: 'Abu Dovud, Tirmiziy', target: 3 },
  { name: 'Badan himoyasi (kechki)', arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', latin: 'Allohumma \'aafinii fii badanii, Allohumma \'aafinii fii sam\'ii, Allohumma \'aafinii fii basarii', source: 'Abu Dovud', target: 3 },
  { name: 'Ofiyat so\'rash (kechki)', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', latin: 'Allohumma innii as\'alukal \'aafiyata fid dunyaa wal aaxiroh', source: 'Abu Dovud, Nasaiy', target: 1 },
  { name: 'Yomonlikdan panoh (kechki)', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', latin: 'A\'uuzu bi kalimaatillahit taammaati min sharri maa xolaq', source: 'Muslim, Ahmad', target: 3 },
  { name: 'Iymon kalimasi (kechki)', arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', latin: 'Laa ilaaha illallohu wahdahu laa shariika lah', source: 'Buxoriy, Muslim', target: 10 },
  { name: 'To\'rt kalima (kechki)', arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', latin: 'Subhaanallohi wal hamdu lillaahi wa laa ilaaha illallohu wallohu Akbar', source: 'Imom Muslim', target: 33 },
  { name: 'Ulug\' tasbeh (kechki)', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', latin: 'Subhaanallohi wa bihamdihi Subhaanallohil \'Aziim', source: 'Imom Muslim', target: 100 },
  { name: 'Mulk surasi', arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', latin: 'Tabaarokallazii biyadihil mulku wa Huwa \'alaa kulli shay\'in Qadiir', source: 'Tirmiziy, Nasaiy', target: 1 },
  { name: 'Uyqu duosi', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', latin: 'Bismikallohumma amuutu wa ahyaa', source: 'Imom Buxoriy', target: 1 },
  { name: 'Kafirun surasi', arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', latin: 'Qul yaa ayyuhal kaafiruun', source: 'Abu Dovud, Tirmiziy', target: 1 },
  { name: 'Sajda surasi', arabic: 'الم تَنْزِيلُ الْكِتَابِ لَا رَيْبَ فِيهِ', latin: 'Alif Laam Miim. Tanziilul kitaabi laa rayba fiih', source: 'Tirmiziy', target: 1 },
];

const GENERAL_DHIKRS = [
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللّٰهِ', latin: 'Subhaanallooh', source: 'Muslim', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلّٰهِ', latin: 'Alhamdulillaah', source: 'Muslim', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللّٰهُ أَكْبَرُ', latin: 'Allohu Akbar', source: 'Muslim', target: 33 },
  { name: 'Salovot', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', latin: 'Allohumma solli \'alaa Muhammadin wa \'alaa aali Muhammad', source: 'Tabaroniy', target: 10 },
  { name: 'Istig\'for', arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', latin: 'Astag\'firullohallazii laa ilaaha illaa Huwal Hayyul Qayyuumu wa atuubu ilayh', source: 'Ibn Sunniy', target: 3 },
  { name: 'G\'am va qarzdan panoh', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', latin: 'Allohumma innii a\'uuzu bika minal hammi wal hazan', source: 'Abu Dovud', target: 1 },
  { name: 'Ya Hayyul Qayyum', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', latin: 'Yaa Hayyu yaa Qayyuumu bi rohmatika astag\'iis', source: 'Ibn Sunniy', target: 1 },
  { name: 'Sayyidul istig\'for', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ', latin: 'Allohumma Anta Rabbiy laa ilaaha illaa Anta', source: 'Imom Buxoriy', target: 1 },
];

function SectionHeader({ icon, label, color, borderColor }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={{ fontSize: 14, fontWeight: '700', color, marginLeft: 6 }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: borderColor, marginLeft: 10 }} />
    </View>
  );
}

function RecCard({ rec, onAdd, theme, colors, useArabic }) {
  const displayText = useArabic ? rec.arabic : rec.latin;
  return (
    <Pressable
      onPress={() => onAdd({ name: rec.name, target: rec.target, arabic: rec.arabic, latin: rec.latin })}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 6 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{rec.name}</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
          {displayText}
        </Text>
        <Text style={{ fontSize: 11, color: theme.primary, marginTop: 1, fontStyle: 'italic' }}>
          {rec.source}{rec.target > 1 ? ` • ${rec.target}x` : ''}
        </Text>
      </View>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
        <Ionicons name="add" size={20} color={theme.primary} />
      </View>
    </Pressable>
  );
}

export default function DhikrSelectorModal({ visible, onClose, dhikrs, selectedId, onSelect, onAdd, theme, colors, t, language }) {
  const useArabic = ARABIC_LANGS.has(language);
  const existingNames = useMemo(() => new Set(dhikrs.map((d) => d.name.toLowerCase())), [dhikrs]);
  const filterNew = (list) => list.filter((r) => !existingNames.has(r.name.toLowerCase()));

  const morning = useMemo(() => filterNew(MORNING_DHIKRS), [existingNames]);
  const evening = useMemo(() => filterNew(EVENING_DHIKRS), [existingNames]);
  const general = useMemo(() => filterNew(GENERAL_DHIKRS), [existingNames]);
  const hasRecs = morning.length > 0 || evening.length > 0 || general.length > 0;

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
            maxHeight: '85%',
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
              const dhikrText = useArabic ? dhikr.arabic : (dhikr.latin || dhikr.arabic);
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
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: isSelected ? theme.primary : colors.border,
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{dhikr.name}</Text>
                    {dhikrText ? (
                      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>{dhikrText}</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: isSelected ? theme.primary : colors.textMuted }}>{dhikr.current_count}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>/ {dhikr.target}</Text>
                  </View>
                </Pressable>
              );
            })}

            {hasRecs && (
              <>
                {morning.length > 0 && (
                  <>
                    <SectionHeader icon="sunny-outline" label={t.morningDhikrs || 'Tonggi zikrlar'} color="#f59e0b" borderColor={colors.border} />
                    {morning.map((rec) => <RecCard key={rec.name} rec={rec} onAdd={onAdd} theme={theme} colors={colors} useArabic={useArabic} />)}
                  </>
                )}

                {evening.length > 0 && (
                  <>
                    <SectionHeader icon="moon-outline" label={t.eveningDhikrs || 'Kechki zikrlar'} color="#6366f1" borderColor={colors.border} />
                    {evening.map((rec) => <RecCard key={rec.name} rec={rec} onAdd={onAdd} theme={theme} colors={colors} useArabic={useArabic} />)}
                  </>
                )}

                {general.length > 0 && (
                  <>
                    <SectionHeader icon="sparkles" label={t.recommendedDhikrs || 'Umumiy zikrlar'} color={theme.primary} borderColor={colors.border} />
                    {general.map((rec) => <RecCard key={rec.name} rec={rec} onAdd={onAdd} theme={theme} colors={colors} useArabic={useArabic} />)}
                  </>
                )}
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
