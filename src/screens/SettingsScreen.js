import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import { SUPPORTED_LANGUAGES } from '../localization';
import { themes } from '../theme/themes';
import { COUNTER_BACKGROUNDS } from '../theme/counterBackgrounds';
import SubscribeButton from '../components/SubscribeButton';
import { exportAllData, importAllData } from '../db/database';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

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
    notificationsOn, setNotificationsOn, dhikrReminderOn, setDhikrReminderOn, volumeButtonOn, setVolumeButtonOn, refreshData,
  } = useApp();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);

      if (Platform.OS === 'android') {
        const { StorageAccessFramework } = FileSystem;
        const perms = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perms.granted) return;
        const fileUri = await StorageAccessFramework.createFileAsync(
          perms.directoryUri,
          'smart-tasbeh-backup',
          'application/json'
        );
        await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      } else {
        const fileUri = FileSystem.documentDirectory + 'smart-tasbeh-backup.json';
        await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: t.exportData });
      }
      Alert.alert(t.exportData, t.exportSuccess);
    } catch (e) {
      // user cancelled — no error to show
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;

      setImporting(true);
      const file = result.assets[0];
      const json = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const data = JSON.parse(json);

      Alert.alert(t.importConfirmTitle, t.importConfirmBody, [
        { text: t.cancel, style: 'cancel', onPress: () => setImporting(false) },
        {
          text: t.importConfirmBtn,
          style: 'destructive',
          onPress: async () => {
            try {
              await importAllData(data);
              await refreshData();
              Alert.alert(t.importData, t.importSuccess);
            } catch (err) {
              Alert.alert(t.importData, t.importError);
            } finally {
              setImporting(false);
            }
          },
        },
      ]);
    } catch (e) {
      Alert.alert(t.importData, t.importError);
      setImporting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Row label={t.darkMode} value={darkMode} onChange={setDarkMode} colors={colors} />
      <Row label={t.sound} value={soundOn} onChange={setSoundOn} colors={colors} />
      <Row label={t.vibration} value={vibrationOn} onChange={setVibrationOn} colors={colors} />
      <Row label={t.autoReset} value={autoReset} onChange={setAutoReset} colors={colors} />
      {Platform.OS !== 'web' && (
        <Row label={t.volumeButtonCount} value={volumeButtonOn} onChange={setVolumeButtonOn} colors={colors} />
      )}
      {Platform.OS === 'web' ? (
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t.prayerReminders}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{t.notifWebNote}</Text>
        </View>
      ) : (
        <Row label={t.prayerReminders} value={notificationsOn} onChange={setNotificationsOn} colors={colors} />
      )}
      {Platform.OS === 'web' ? (
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t.dhikrReminders}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{t.dhikrReminderWebNote}</Text>
        </View>
      ) : (
        <Row label={t.dhikrReminders} value={dhikrReminderOn} onChange={setDhikrReminderOn} colors={colors} />
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

      {/* Backup & Restore */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="cloud-download-outline" size={20} color={theme.primary} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginLeft: 8 }}>{t.backupRestore}</Text>
        </View>

        <View style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>{t.backupHint}</Text>
        </View>

        {Platform.OS === 'web' ? (
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Backup & restore is available in the Android and iOS app.</Text>
        ) : (
          <>
            <Pressable
              onPress={handleExport}
              disabled={exporting}
              style={{ backgroundColor: theme.primary, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: exporting ? 0.6 : 1 }}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="download-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{t.exportData}</Text>
            </Pressable>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 14, paddingHorizontal: 4 }}>{t.exportDesc}</Text>

            <Pressable
              onPress={handleImport}
              disabled={importing}
              style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, opacity: importing ? 0.6 : 1 }}
            >
              {importing ? (
                <ActivityIndicator color={theme.primary} size="small" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="push-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{t.importData}</Text>
            </Pressable>
            <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 4 }}>{t.importDesc}</Text>
          </>
        )}
      </View>

      {/* About / Contact — required by Google AdMob & Play Store policies */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginTop: 16, marginBottom: 8 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>{t.aboutApp}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>{t.aboutDescription}</Text>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 6 }}>{t.developer}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Hamrayev Sohib</Text>
        </View>

        <Pressable
          onPress={() => Linking.openURL('mailto:hamrayevsohibjon@gmail.com')}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
        >
          <Ionicons name="mail-outline" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 13, marginLeft: 8 }}>hamrayevsohibjon@gmail.com</Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL('https://t.me/sohibjon31')}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
        >
          <Ionicons name="paper-plane-outline" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 13, marginLeft: 8 }}>@sohibjon31</Text>
        </Pressable>
      </View>

      <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 20 }}>
        Smart Tasbeh v1.0.0
      </Text>
    </ScrollView>
  );
}
