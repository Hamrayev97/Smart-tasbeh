# Smart Tasbeh – Dhikr Counter App

Offline-first Expo/React Native app with minimalist Islamic UI and complete core architecture.

## Implemented Architecture

- **Navigation:** bottom tabs (Counter, Statistics, Dhikr List, Qibla, Ramadan, Settings)
- **Qibla & Prayer Times:** device GPS (`expo-location`) + the free [Aladhan API](https://aladhan.com) compute the Qibla bearing (great-circle formula to the Kaaba) and the day's five prayer times, with the next upcoming prayer highlighted. The compass rotates live on Android/iOS via the device's magnetic heading; on web (no heading sensor access) it shows a static bearing in degrees instead. The location + Aladhan fetch is shared via `src/hooks/usePrayerTimes.js`.
- **Ramadan mode:** when the Aladhan response's Hijri date falls in Ramadan (month 9), shows the current Ramadan day, Suhoor-end/Iftar times (Fajr/Maghrib reused from the same fetch), and a per-day fasting toggle backed by a new `FastingDays` table (`date`, `fasted`). Outside Ramadan it just shows the current Hijri date.
- **State layer:** `AppProvider` context for app settings, selected dhikr, counting actions, and localization
- **Persistence:** local offline storage with two logical tables:
  - `Dhikr`: `id`, `name`, `current_count`, `total_count`, `target`, `color_theme`, `created_date`
  - `Stats`: `date`, `count`
  - `FastingDays`: `date`, `fasted`
- **Localization:** all UI text loaded from JSON language files
- **Themes:** emerald primary + gold accent, plus additional themes
- **Monetization:** free/premium state; AdMob banner ads on the Counter and Statistics screens (hidden for premium users), dimmed to ~65% opacity in dark mode so they don't clash with the dark UI; interstitial placement is still a placeholder. A monthly Premium subscription (`react-native-iap`) sets `premium` for real on Android/iOS. A donation button opens an external link (Android/iOS/web).
- **Widget sync adapter:** shared storage bridge (`src/widgetSync.js`) for native home-screen widget integration

## Supported Languages

- English (`en`)
- Arabic (`ar`)
- Turkish (`tr`)
- Indonesian (`id`)
- Urdu (`ur`)
- Russian (`ru`)
- French (`fr`)
- Bengali (`bn`)
- Malay (`ms`)
- Uzbek (`uz`)

## Run

```bash
npm install
npm run start -- --offline
```

Press `w` to preview in a browser, or scan the QR code with Expo Go for a native preview. AdMob banners only render on Android/iOS (`AdBanner.web.js` is a no-op stub on web, since `react-native-google-mobile-ads` has no web implementation).

## Notes

- This repo now provides full app structure, screen logic, data logic, and navigation flow.
- Home screen widget requires native Android/iOS extension code, but app-side sync contract is included.
- `app.json` and `src/components/AdBanner.js` currently use Google's official **test** AdMob App/Unit IDs. Replace `androidAppId`/`iosAppId` in `app.json` and `PRODUCTION_BANNER_UNIT_ID` in `src/components/AdBanner.js` with your real AdMob IDs before publishing.
- `expo-font` is pinned explicitly because `@expo/vector-icons` declares it as a wildcard peer dependency (`"expo-font": "*"`); without the pin, `npm install` can resolve a much newer `expo-font` than this Expo SDK 50 project uses, which breaks font loading on web.
- `src/components/SubscribeButton.js` uses a placeholder auto-renewing subscription ID (`premium_monthly`, see `PREMIUM_MONTHLY_SKU`). Create a matching subscription (with a base plan/offer on Android) in Play Console / App Store Connect and update the SKU before publishing. Subscriptions only work on Android/iOS (`react-native-iap` has no web implementation), and can't be tested without a real store listing — Play Console requires a one-time $25 developer registration and a payments profile before subscriptions can even be configured.
- `src/components/DonateButton.js` opens a placeholder URL (`DONATION_URL`). Replace it with your real Payme/Click/PayPal donation link before publishing — note that receiving payments as a business via Payme/Click in Uzbekistan generally requires registering as a YATT (or other legal entity); a personal card/phone-number transfer link doesn't.
- Home screen widget: only the storage bridge (`src/widgetSync.js`) exists. The native Android/iOS widget UI itself (Kotlin/Swift + Xcode/Android Studio project) hasn't been built — that's a separate, larger native-development task.
