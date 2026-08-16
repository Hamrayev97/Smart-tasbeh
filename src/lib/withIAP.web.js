// react-native-iap has no web implementation, so web builds skip the
// IAP context wrapper entirely — RemoveAdsButton.web.js renders nothing there.
export default function withIAP(Component) {
  return Component;
}
