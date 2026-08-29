import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const PRODUCTION_INTERSTITIAL_ID = Platform.select({
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA',
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB',
});

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL_ID;

const COOLDOWN_MS = 3 * 60 * 1000;

let lastShownAt = 0;
let ad = null;
let adLoaded = false;

function loadAd() {
  ad = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    adLoaded = true;
  });

  ad.addAdEventListener(AdEventType.CLOSED, () => {
    adLoaded = false;
    loadAd();
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    adLoaded = false;
    setTimeout(loadAd, 30000);
  });

  ad.load();
}

export function preloadInterstitial() {
  loadAd();
}

export function showInterstitialIfReady() {
  const now = Date.now();
  if (!adLoaded || !ad) return false;
  if (now - lastShownAt < COOLDOWN_MS) return false;

  ad.show();
  lastShownAt = now;
  adLoaded = false;
  return true;
}
