# Smart Tasbeh – Dhikr Counter App

Offline-first Expo/React Native app with minimalist Islamic UI and complete core architecture.

## Implemented Architecture

- **Navigation:** bottom tabs (Counter, Statistics, Dhikr List, Qibla, Ramadan, Settings)
- **Qibla & Prayer Times:** device GPS (`expo-location`) + the free [Aladhan API](https://aladhan.com) compute the Qibla bearing (great-circle formula to the Kaaba) and the day's five prayer times, with the next upcoming prayer highlighted. The compass rotates live on Android/iOS via the device's magnetic heading; on web (no heading sensor access) it shows a static bearing in degrees instead. The location + Aladhan fetch is shared via `src/hooks/usePrayerTimes.js`.
- **Location permission UX:** `src/components/LocationPermissionGate.js` (used by Qibla and Ramadan) explains *why* location is needed before the OS prompt appears, instead of firing the system dialog with no context — the single biggest reason users tap "Don't allow". If denied, it offers a button straight to the device's app settings instead of a dead end.
- **Ramadan mode:** when the Aladhan response's Hijri date falls in Ramadan (month 9), shows the current Ramadan day, Suhoor-end/Iftar times (Fajr/Maghrib reused from the same fetch), and a per-day fasting toggle backed by a `FastingDays` table (`date`, `fasted`). Outside Ramadan it just shows the current Hijri date.
- **Ramadan monthly calendar:** `src/hooks/useHijriMonthCalendar.js` fetches the whole Ramadan month in one call (`GET /v1/hijriCalendar/{year}/{month}`) and `RamadanScreen` lists every day with its Hijri/Gregorian date, Suhoor/Iftar times, and a tappable fasted toggle — so users can plan ahead instead of only seeing today. Fasting state moved from a single today-only boolean to `getAllFastingDates()` (a `Set` of every fasted date), letting any day in the list be toggled, not just today. Aladhan times come back as `"HH:mm (+TZ)"` (e.g. `"04:12 (+05)"`); a shared `formatTime` helper strips the timezone suffix before display/parsing — this also fixed a latent bug in `QiblaScreen`'s "next prayer" calculation, which broke on real (non-mocked) API responses because `Number("12 (+05)")` is `NaN`.
- **Prayer time reminders:** an opt-in Settings toggle (native only — `src/lib/notifications.js` vs. a no-op `.web.js`) schedules five repeating local notifications a day (`expo-notifications`, `trigger: { hour, minute, repeats: true }`) for Fajr/Dhuhr/Asr/Maghrib/Isha, using Suhoor/Iftar wording for Fajr/Maghrib during Ramadan. Turning it on requests notification + location permission and does an immediate Aladhan fetch to schedule today's times; afterwards, `usePrayerTimes` silently re-schedules with fresh times every time the Qibla or Ramadan screen is opened, so the reminders stay in sync as prayer times drift through the year without needing a background task. The Aladhan request itself was pulled out into `src/lib/fetchPrayerTimings.js`, shared by `usePrayerTimes`, `useAppContext`, and the reminder scheduler instead of being duplicated.
- **Daily "come back" dhikr reminders:** a second, independent Settings toggle nudges the user if they haven't opened the app. Rather than a plain repeating daily notification (which fires whether or not the user already opened the app that day), `scheduleEngagementReminders` schedules two *one-shot* notifications for the next occurrence of two fixed hours (10:00/20:00 by default); `useAppContext` re-invokes it on every cold start and every `AppState` foreground resume, cancelling and re-scheduling further out each time — so a reminder only actually reaches the user if the app has genuinely stayed unopened until then. Prayer and engagement notifications track their own scheduled-notification IDs in separate `AsyncStorage` keys (`src/lib/notifications.js`) so turning one off, or rescheduling it, never wipes out the other.
- **Tap-anywhere counting (opt-in lock mode):** a "Tap Anywhere to Count" button below the circle turns on a full-screen mode — a translucent white veil covers the whole screen (a sibling `Pressable` absolutely positioned over the normal content, not inside it, so it isn't affected by scrolling) and *any* tap on it increments, with the live count shown large in the center. A lock-closed icon floats in the corner to exit the mode, restoring normal behavior (only the circle counts; chips and Reset work as before). This is deliberately a separate, explicit mode rather than making the whole screen always tappable, so normal navigation (picking a dhikr, hitting Reset) can't be accidentally miscounted as a tap.
- **Per-dhikr lifetime total:** `DhikrListScreen` now shows each dhikr's all-time `total_count` (not just its default target), so users can see how many times a given dhikr has ever been recited, alongside the existing per-dhikr target editing.
- **State layer:** `AppProvider` context for app settings, selected dhikr, counting actions, and localization
- **Persistence:** local offline storage with two logical tables:
  - `Dhikr`: `id`, `name`, `current_count`, `total_count`, `target`, `color_theme`, `created_date`
  - `Stats`: `date`, `count`
  - `FastingDays`: `date`, `fasted`
- **Localization:** all UI text loaded from JSON language files
- **Themes:** emerald primary + gold accent, plus additional themes
- **Monetization:** free/premium state; AdMob banner ads on the Counter and Statistics screens (hidden for premium users), dimmed to ~65% opacity in dark mode so they don't clash with the dark UI; interstitial placement is still a placeholder. A monthly Premium subscription (`react-native-iap`) sets `premium` for real on Android/iOS. A donation button opens an external link (Android/iOS/web).
- **Widget sync adapter:** shared storage bridge (`src/widgetSync.js`) for native home-screen widget integration
- **App icon:** `assets/icon.png` (opaque, radial emerald-to-dark-green background), `assets/adaptive-icon.png` (transparent foreground for Android's adaptive-icon system, subject sized within the ~66% safe zone), and `assets/splash.png` (solid `#0A3D0A` background) — `app.json` already pointed at these paths but the files didn't exist until now. The source design was an AI-generated gem-and-filigree graphic whose "transparent" background turned out to be a checkerboard baked into opaque RGB pixels rather than a real alpha channel; it was cleaned up by measuring the design's true circular bounds and compositing fresh backgrounds per file instead of trusting the checkerboard as transparency.

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
- Hindi (`hi`)

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
