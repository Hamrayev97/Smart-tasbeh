import React from 'react';
import { Image, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useApp } from '../hooks/useAppContext';
import { SUPPORTED_LANGUAGES } from '../localization';
import { themes } from '../theme/themes';
import { COUNTER_BACKGROUNDS } from '../theme/counterBackgrounds';
import SubscribeButton from '../components/SubscribeButton';
import DonateButton from '../components/DonateButton';

const Row = ({ label, value, onChange, colors }) => (
  <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
    <Switch value={value} onValueChange={onChange} />
  </View>
);

export default function SettingsScreen() {
  const {
    t, colors, theme, darkMode, setDarkMode, soundOn, setSoundOn, vibrationOn, setVibrationOn, autoReset, setAutoReset,
    language, setLanguage, themeId, setThemeId, bgThemeId, setBgThemeId, premium, setPremium,
    notificationsOn, setNotificationsOn,
  } = useApp();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Row label={t.darkMode} value={darkMode} onChange={setDarkMode} colors={colors} />
      <Row label={t.sound} value={soundOn} onChange={setSoundOn} colors={colors} />
      <Row label={t.vibration} value={vibrationOn} onChange={setVibrationOn} colors={colors} />
      <Row label={t.autoReset} value={autoReset} onChange={setAutoReset} colors={colors} />
      {Platform.OS === 'web' ? (
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t.prayerReminders}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{t.notifWebNote}</Text>
        </View>
      ) : (
        <Row label={t.prayerReminders} value={notificationsOn} onChange={setNotificationsOn} colors={colors} />
      )}

      <Text style={{ color: colors.text, marginTop: 8, marginBottom: 8, fontWeight: '700' }}>{t.language}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {SUPPORTED_LANGUAGES.map((item) => (
          <Pressable key={item.code} onPress={() => setLanguage(item.code)} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, marginRight: 8, marginBottom: 8, backgroundColor: language === item.code ? colors.primary : colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: language === item.code ? '#fff' : colors.text }}>{item.flag} {item.code.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: colors.text, marginTop: 8, marginBottom: 8, fontWeight: '700' }}>{t.counterBackground}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {COUNTER_BACKGROUNDS.map((bg) => (
          <Pressable
            key={bg.id}
            onPress={() => setBgThemeId(bg.id)}
            style={{
              width: 76,
              marginRight: 10,
              marginBottom: 10,
              alignItems: 'center',
            }}
          >
            <Image
              source={bg.image}
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                borderWidth: bgThemeId === bg.id ? 3 : 1,
                borderColor: bgThemeId === bg.id ? theme.primary : colors.border,
              }}
              resizeMode="cover"
            />
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>{bg.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: colors.text, marginTop: 8, marginBottom: 8, fontWeight: '700' }}>{t.theme}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Object.values(themes).map((item) => (
          <Pressable key={item.id} onPress={() => setThemeId(item.id)} style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10, marginBottom: 10, backgroundColor: item.primary, borderWidth: themeId === item.id ? 3 : 1, borderColor: themeId === item.id ? item.accent : colors.border }} />
        ))}
      </View>

      <Pressable
        onPress={() => __DEV__ && setPremium(!premium)}
        style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginTop: 8 }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t.premium}: {premium ? t.enabled : t.disabled}</Text>
        <Text style={{ color: colors.textMuted, marginTop: 6 }}>{t.noAds} • {t.extraThemes} • {t.advancedStats}</Text>
        {__DEV__ && <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>(dev: tap to toggle)</Text>}
      </Pressable>

      <SubscribeButton />
      <DonateButton />
    </ScrollView>
  );
}
