import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useApp } from '../hooks/useAppContext';

// TODO: replace with real AdMob banner unit IDs before publishing to the stores.
const PRODUCTION_BANNER_UNIT_ID = Platform.select({
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
});

const adUnitId = __DEV__ ? TestIds.BANNER : PRODUCTION_BANNER_UNIT_ID;

// Dim the banner in dark mode instead of showing a bright white ad against a dark UI —
// this is the #1 complaint users have about competing dhikr apps.
const DARK_MODE_AD_OPACITY = 0.65;

export default function AdBanner() {
  const { premium, darkMode, colors } = useApp();

  if (premium) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        marginTop: 16,
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: darkMode ? DARK_MODE_AD_OPACITY : 1,
      }}
    >
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
