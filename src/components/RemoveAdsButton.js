import React, { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { useIAP } from 'react-native-iap';
import { useApp } from '../hooks/useAppContext';

// TODO: replace with the real non-consumable product ID created in Play Console / App Store Connect.
export const REMOVE_ADS_SKU = 'remove_ads';

export default function RemoveAdsButton() {
  const { t, colors, theme, premium, setPremium } = useApp();
  const { connected, products, getProducts, requestPurchase, getAvailablePurchases, availablePurchases, currentPurchase, currentPurchaseError, finishTransaction } = useIAP();

  useEffect(() => {
    if (connected) {
      getProducts({ skus: [REMOVE_ADS_SKU] }).catch(() => null);
      getAvailablePurchases().catch(() => null);
    }
  }, [connected]);

  useEffect(() => {
    if (availablePurchases.some((p) => p.productId === REMOVE_ADS_SKU) && !premium) {
      setPremium(true);
    }
  }, [availablePurchases]);

  useEffect(() => {
    if (currentPurchase?.productId === REMOVE_ADS_SKU) {
      setPremium(true);
      finishTransaction({ purchase: currentPurchase, isConsumable: false }).catch(() => null);
    }
  }, [currentPurchase]);

  if (premium) return null;

  const product = products.find((p) => p.productId === REMOVE_ADS_SKU);

  return (
    <Pressable
      onPress={() => requestPurchase({ skus: [REMOVE_ADS_SKU] }).catch(() => null)}
      style={{ backgroundColor: theme.primary, borderRadius: 12, padding: 14, marginTop: 10, alignItems: 'center' }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>
        {t.removeAdsPurchase}{product?.localizedPrice ? ` — ${product.localizedPrice}` : ''}
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
