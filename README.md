# 📿 Smart Tasbeh — React Native (Expo)

Professional Islamic dhikr counter app with AdMob monetization.

---

## 🚀 O'rnatish (Setup)

### 1. Kerakli dasturlar
- **Node.js** (v18+): https://nodejs.org
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (build uchun): `npm install -g eas-cli`
- **Android Studio** (Android uchun)

### 2. Loyihani ochish
```bash
cd SmartTasbeh
npm install
```

### 3. Ishga tushirish (test)
```bash
npx expo start
```
Telefonda **Expo Go** ilovasini o'rnating, QR kodni skanlang.

---

## 📱 Play Marketga chiqarish

### 1. EAS sozlash
```bash
eas login
eas build:configure
```

### 2. APK/AAB build qilish
```bash
# Test APK (debug)
eas build --platform android --profile preview

# Play Market uchun (release)  
eas build --platform android --profile production
```

### 3. Play Console
1. https://play.google.com/console ga kiring
2. Yangi ilova yarating
3. AAB faylni yuklang
4. Tavsif, rasmlar qo'shing
5. Nashr qiling

---

## 💰 AdMob Ulash

### 1. AdMob akkaunt
1. https://admob.google.com ga kiring
2. Yangi ilova qo'shing
3. **App ID** oling (masalan: `ca-app-pub-XXXXXXXX~XXXXXXXX`)

### 2. Ad Unit yaratish
- **Banner** → Statistics ekrani uchun
- **Interstitial** → Har 20 tap uchun
- **Rewarded** → Premium ochish uchun

### 3. ID larni kiritish
`src/utils/admob.js` faylida o'z ID laringizni qo'ying:
```javascript
banner: 'ca-app-pub-YOUR_ID/YOUR_UNIT_ID',
interstitial: 'ca-app-pub-YOUR_ID/YOUR_UNIT_ID',
```

### 4. app.json da App ID qo'ying
```json
["react-native-google-mobile-ads", {
  "androidAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
}]
```

### 5. AdMob komponentlarini aktivlashtirish
`StatisticsScreen.js` da banner:
```jsx
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../utils/admob';

// JSX ichida:
{!isPremium && (
  <BannerAd 
    unitId={AD_UNIT_IDS.banner} 
    size={BannerAdSize.BANNER}
    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
  />
)}
```

---

## 📁 Fayl tuzilmasi

```
SmartTasbeh/
├── App.js                    # Asosiy kirish nuqtasi + navigatsiya
├── app.json                  # Expo konfiguratsiya
├── package.json              # Dependensiyalar
└── src/
    ├── screens/
    │   ├── CounterScreen.js  # Asosiy tasbeh ekrani
    │   ├── StatisticsScreen.js # Statistika + charts
    │   ├── DhikrListScreen.js  # Zikirlar ro'yxati
    │   └── SettingsScreen.js   # Sozlamalar + Premium
    ├── hooks/
    │   └── useAppContext.js  # Global state + AsyncStorage
    ├── data/
    │   ├── languages.js      # 10 ta til (en, uz, ar, tr, ru, fr, id, ur, bn, ms)
    │   └── themes.js         # 5 ta rang mavzusi + default zikirlar
    └── utils/
        └── admob.js          # AdMob ID lar va yo'riqnoma
```

---

## ✨ Funksiyalar

| Funksiya | Tavsif |
|---|---|
| 📿 Counter | Animatsiyali katta tugma, haptic feedback |
| 📊 Statistics | Haftalik grafik, kunlik/oylik/umrbod |
| 📋 Dhikr boshqaruv | Qo'shish, tahrirlash, o'chirish |
| ⚙️ Sozlamalar | Dark mode, 5 mavzu, 10 til, Premium |
| 💾 Offline | AsyncStorage — internet kerak emas |
| 💰 AdMob | Banner + Interstitial (bepul versiya) |
| ⭐ Premium | Reklamasiz + qo'shimcha mavzular |
| 🔔 Haptics | Tebranish feedback |
| 🌙 Dark/Light | Avtomatik yoki qo'lda |
| 🌍 10 til | uz, en, ar, tr, ru, fr, id, ur, bn, ms |

---

## 💡 Maslahatlar

- **Test paytida** AdMob test ID laridan foydalaning
- **Release build**da asl ID larni ishlatng
- Play Market ko'rib chiqishi **7 kun** talab qilishi mumkin
- Monetizatsiyadan **foyda** olish uchun 1000+ kunlik foydalanuvchi kerak

---

## 📞 Yordam

Muammo bo'lsa, Expo docs: https://docs.expo.dev
