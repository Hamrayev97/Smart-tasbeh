import React, { useEffect } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { useIAP } from 'react-native-iap';
import { useApp } from '../hooks/useAppContext';

// TODO: replace with the real auto-renewing subscription ID created in Play Console / App Store Connect.
export const PREMIUM_MONTHLY_SKU = 'premium_monthly';

export default function SubscribeButton() {
  const { t, colors, theme, premium, setPremium } = useApp();
  const {
    connected,
    subscriptions,
    getSubscriptions,
    requestSubscription,
    getAvailablePurchases,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
  } = useIAP();

  useEffect(() => {
    if (connected) {
      getSubscriptions({ skus: [PREMIUM_MONTHLY_SKU] }).catch(() => null);
      getAvailablePurchases().catch(() => null);
    }
  }, [connected]);

  // An active subscription found on the device (e.g. after reinstall) re-unlocks premium.
  useEffect(() => {
    if (availablePurchases.some((p) => p.productId === PREMIUM_MONTHLY_SKU) && !premium) {
      setPremium(true);
    }
  }, [availablePurchases]);

  useEffect(() => {
    if (currentPurchase?.productId === PREMIUM_MONTHLY_SKU) {
      setPremium(true);
      finishTransaction({ purchase: currentPurchase, isConsumable: false }).catch(() => null);
    }
  }, [currentPurchase]);

  if (premium) return null;

  const subscription = subscriptions.find((s) => s.productId === PREMIUM_MONTHLY_SKU);
  const androidOffer = Platform.OS === 'android' ? subscription?.subscriptionOfferDetails?.[0] : null;
  const price =
    Platform.OS === 'android'
      ? androidOffer?.pricingPhases?.pricingPhaseList?.[0]?.formattedPrice
      : subscription?.localizedPrice;

  const handleSubscribe = () => {
    if (Platform.OS === 'android') {
      if (!androidOffer) return;
      requestSubscription({
        sku: PREMIUM_MONTHLY_SKU,
        subscriptionOffers: [{ sku: PREMIUM_MONTHLY_SKU, offerToken: androidOffer.offerToken }],
      }).catch(() => null);
    } else {
      requestSubscription({ sku: PREMIUM_MONTHLY_SKU }).catch(() => null);
    }
  };

  return (
    <Pressable onPress={handleSubscribe} style={{ backgroundColor: theme.primary, borderRadius: 12, padding: 14, marginTop: 10, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>
        {t.subscribePremium}{price ? ` — ${price}/${t.perMonth}` : ''}
      </Text>
      {currentPurchaseError ? (
        <Text style={{ color: '#ffe1e1', fontSize: 11, marginTop: 4 }}>{currentPurchaseError.message}</Text>
      ) : null}
      <Text
        onPress={() => getAvailablePurchases().catch(() => null)}
        style={{ color: colors.background, opacity: 0.8, fontSize: 11, marginTop: 6, textDecorationLine: 'underline' }}
      >
        {t.restorePurchases}
      </Text>
    </Pressable>
  );
}
