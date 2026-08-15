// react-native-google-mobile-ads has no web implementation and pulls in a
// native Fabric component spec that fails to bundle for web, so this file
// is picked up instead of initAds.js on web builds.
export default function initAds() {}
