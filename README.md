# Smart Tasbeh – Dhikr Counter App

Offline-first Expo/React Native app with minimalist Islamic UI and complete core architecture.

## Implemented Architecture

- **Navigation:** bottom tabs (Counter, Statistics, Dhikr List, Settings)
- **State layer:** `AppProvider` context for app settings, selected dhikr, counting actions, and localization
- **Persistence:** local offline storage with two logical tables:
  - `Dhikr`: `id`, `name`, `current_count`, `total_count`, `target`, `color_theme`, `created_date`
  - `Stats`: `date`, `count`
- **Localization:** all UI text loaded from JSON language files
- **Themes:** emerald primary + gold accent, plus additional themes
- **Monetization architecture:** free/premium state with banner/interstitial placeholders in UI flow
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

## Notes

- This repo now provides full app structure, screen logic, data logic, and navigation flow.
- Home screen widget requires native Android/iOS extension code, but app-side sync contract is included.
