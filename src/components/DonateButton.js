import React from 'react';
import { Linking, Pressable, Text } from 'react-native';
import { useApp } from '../hooks/useAppContext';

// TODO: replace with your real Payme/Click/PayPal donation link before publishing.
export const DONATION_URL = 'https://example.com/donate-smart-tasbeh';

export default function DonateButton() {
  const { t, theme } = useApp();

  return (
    <Pressable
      onPress={() => Linking.openURL(DONATION_URL).catch(() => null)}
      style={{ backgroundColor: theme.accent, borderRadius: 12, padding: 14, marginTop: 10, alignItems: 'center' }}
    >
      <Text style={{ color: '#2e2814', fontWeight: '700' }}>{t.donate}</Text>
    </Pressable>
  );
}
