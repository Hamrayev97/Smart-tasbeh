import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SUPPORTED_LANGUAGES, getTranslation } from '../localization';
import { themes } from '../theme/themes';
import { requestNotificationPermission } from '../lib/notifications';

export default function OnboardingScreen({ onComplete, initialLanguage, onLanguageChange }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(initialLanguage || 'en');
  const t = useMemo(() => getTranslation(language), [language]);
  const theme = themes.emerald;

  const handleLanguageSelect = (code) => {
    setLanguage(code);
    onLanguageChange?.(code);
  };

  const handleAllowAll = async () => {
    if (Platform.OS !== 'web') {
      await Location.requestForegroundPermissionsAsync().catch(() => null);
      await requestNotificationPermission().catch(() => null);
    }
    onComplete();
  };

  if (step === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f9f5', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ fontSize: 42, marginBottom: 12 }}>📿</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: theme.primary, textAlign: 'center' }}>
            {t.welcomeTitle}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7b6b', marginTop: 8, textAlign: 'center' }}>
            {t.welcomeSubtitle}
          </Text>
        </View>

        <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {SUPPORTED_LANGUAGES.map((item) => (
              <Pressable
                key={item.code}
                onPress={() => handleLanguageSelect(item.code)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 24,
                  backgroundColor: language === item.code ? theme.primary : '#fff',
                  borderWidth: 1.5,
                  borderColor: language === item.code ? theme.primary : '#dce5dc',
                  minWidth: 90,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: language === item.code ? '#fff' : '#2e3e2e',
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  {item.flag} {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
          <Pressable
            onPress={() => setStep(1)}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{t.continueBtn}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f9f5', justifyContent: 'center', paddingHorizontal: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <Ionicons name="shield-checkmark" size={32} color={theme.primary} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1a2e1a', textAlign: 'center' }}>
          {t.permissionsTitle}
        </Text>
        <Text style={{ fontSize: 13, color: '#6b7b6b', marginTop: 6, textAlign: 'center' }}>
          {t.permissionsSubtitle}
        </Text>
      </View>

      <View style={{
        backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: '#dce5dc',
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', padding: 16,
          borderBottomWidth: 1, borderBottomColor: '#f0f4f0',
        }}>
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="location" size={20} color="#1565C0" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: '700', color: '#1a2e1a', fontSize: 15 }}>{t.locationPermLabel}</Text>
            <Text style={{ color: '#7a8e7a', fontSize: 12, marginTop: 2 }}>{t.locationPermDesc}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: '#fce4ec', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="notifications" size={20} color="#C62828" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: '700', color: '#1a2e1a', fontSize: 15 }}>{t.notifPermLabel}</Text>
            <Text style={{ color: '#7a8e7a', fontSize: 12, marginTop: 2 }}>{t.notifPermDesc}</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleAllowAll}
        style={{
          backgroundColor: theme.primary, borderRadius: 16,
          paddingVertical: 16, alignItems: 'center', marginTop: 24,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{t.allowAll}</Text>
      </Pressable>

      <Pressable
        onPress={onComplete}
        style={{ alignItems: 'center', marginTop: 14 }}
      >
        <Text style={{ color: '#7a8e7a', fontWeight: '600', fontSize: 14 }}>{t.skipForNow}</Text>
      </Pressable>
    </View>
  );
}
