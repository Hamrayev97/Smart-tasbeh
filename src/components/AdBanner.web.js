// react-native-google-mobile-ads has no web implementation — AdMob banners
// only render on Android/iOS. Metro picks this file automatically for web
// builds, so no ads are shown there instead of crashing on import.
export default function AdBanner() {
  return null;
}
