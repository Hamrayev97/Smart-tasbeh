import React from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';

// Shared by QiblaScreen and RamadanScreen: explains why location is needed
// *before* the OS permission dialog appears, since a bare system prompt with
// no context is the single biggest reason users tap "Don't allow".
export default function LocationPermissionGate({ status, requestPermission, children }) {
  const { t, colors, theme } = useApp();

  if (status === 'checking' || status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (status === 'prompt') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 28 }}>
        <Ionicons name="location" size={44} color={theme.primary} />
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17, textAlign: 'center', marginTop: 14 }}>{t.locationPromptTitle}</Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>{t.locationPromptBody}</Text>
        <Pressable onPress={requestPermission} style={{ backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, marginTop: 20 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t.enableLocation}</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 28 }}>
        <Ionicons name="location-outline" size={44} color={colors.textMuted} />
        <Text style={{ color: colors.text, fontWeight: '600', textAlign: 'center', marginTop: 14 }}>
          {status === 'denied' ? t.locationDenied : t.locationError}
        </Text>
        {status === 'denied' ? (
          <Pressable onPress={() => Linking.openSettings()} style={{ backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t.openSettings}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={requestPermission} style={{ backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t.tryAgain}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return children;
}
