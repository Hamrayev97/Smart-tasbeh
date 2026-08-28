import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState, Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

import { getTranslation } from '../localization';
import { themes } from '../theme/themes';
import { pushWidgetState } from '../widgetSync';
import { fetchTodayTimings } from '../lib/fetchPrayerTimings';
import {
  cancelEngagementReminders,
  cancelPrayerNotifications,
  requestNotificationPermission,
  scheduleEngagementReminders,
  schedulePrayerNotifications,
} from '../lib/notifications';
import {
  addDhikr,
  deleteDhikr,
  getAggregatedStats,
  getDhikrs,
  incrementDhikrCount,
  initDatabase,
  resetAllDailyCounts,
  resetCurrentDhikrCount,
  updateDhikr,
} from '../db/database';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [language, setLanguage] = useState('en');
  const [themeId, setThemeId] = useState('emerald');
  const [bgThemeId, setBgThemeId] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [autoReset, setAutoReset] = useState(false);
  const [premium, setPremium] = useState(false);
  const [notificationsOn, setNotificationsOnState] = useState(false);
  const [dhikrReminderOn, setDhikrReminderOnState] = useState(false);
  const [dhikrs, setDhikrs] = useState([]);
  const [selectedDhikrId, setSelectedDhikrId] = useState(null);
  const [stats, setStats] = useState({ today: 0, weekly: 0, monthly: 0, lifetime: 0, mostRecited: '-', weeklySeries: [], monthlySeries: [], heatmapData: [], bestDay: null, currentStreak: 0, longestStreak: 0, dhikrBreakdown: [] });
  const tickSoundRef = useRef(null);

  const t = useMemo(() => getTranslation(language), [language]);
  const theme = themes[themeId] || themes.emerald;
  const colors = darkMode ? themes.night : theme;

  const hydrate = async () => {
    await initDatabase();
    const saved = await AsyncStorage.multiGet(['language', 'themeId', 'bgThemeId', 'darkMode', 'soundOn', 'vibrationOn', 'autoReset', 'premium', 'notificationsOn', 'dhikrReminderOn', 'onboardingDone']);
    const map = Object.fromEntries(saved);
    if (map.language) setLanguage(map.language);
    if (map.themeId) setThemeId(map.themeId);
    if (map.bgThemeId) setBgThemeId(map.bgThemeId);
    setDarkMode(map.darkMode === 'true');
    setSoundOn(map.soundOn !== 'false');
    setVibrationOn(map.vibrationOn !== 'false');
    setAutoReset(map.autoReset === 'true');
    setPremium(map.premium === 'true');
    setNotificationsOnState(map.notificationsOn === 'true');
    setDhikrReminderOnState(map.dhikrReminderOn === 'true');
    setOnboardingDone(map.onboardingDone === 'true');

    await refreshData();
    setLoading(false);
  };

  const refreshData = async () => {
    const allDhikrs = await getDhikrs();
    setDhikrs(allDhikrs);
    if (!selectedDhikrId && allDhikrs.length) setSelectedDhikrId(allDhikrs[0].id);
    if (selectedDhikrId && !allDhikrs.find((d) => d.id === selectedDhikrId)) setSelectedDhikrId(allDhikrs[0]?.id || null);
    const aggregated = await getAggregatedStats();
    setStats(aggregated);
    const focused = allDhikrs.find((d) => d.id === (selectedDhikrId || allDhikrs[0]?.id));
    pushWidgetState({ count: focused?.current_count || 0, dhikr: focused?.name || '' }).catch(() => null);
  };

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.multiGet(['appOpenCount', 'ratePromptShown']).then(([[, countStr], [, shown]]) => {
      const count = parseInt(countStr || '0', 10) + 1;
      AsyncStorage.setItem('appOpenCount', String(count));
      if (count >= 7 && shown !== 'true') {
        const storeUrl = Platform.OS === 'ios'
          ? 'itms-apps://itunes.apple.com/app/id000000000'
          : 'market://details?id=com.hamrayev97.smarttasbeh';
        setTimeout(() => {
          Alert.alert(t.rateAppTitle, t.rateAppBody, [
            { text: t.maybeLater, style: 'cancel' },
            { text: t.rateNow, onPress: () => { AsyncStorage.setItem('ratePromptShown', 'true'); Linking.openURL(storeUrl).catch(() => null); } },
          ]);
        }, 3000);
      }
    });
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    Audio.Sound.createAsync(require('../../assets/tick.wav'))
      .then(({ sound }) => {
        if (isMounted) tickSoundRef.current = sound;
        else sound.unloadAsync();
      })
      .catch(() => null);
    return () => {
      isMounted = false;
      tickSoundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (!dhikrReminderOn) return;

    const resync = () => {
      scheduleEngagementReminders({
        title: t.dhikrReminderTitle,
        body: t.dhikrReminderBody,
      }).catch(() => null);
    };

    // Reschedule right away (covers cold start / toggling on / language
    // change) and again every time the app is resumed from the background —
    // each call pushes the reminders further out, so they only actually
    // reach the user if the app really has stayed unopened until then.
    resync();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resync();
    });
    return () => sub.remove();
  }, [dhikrReminderOn, t]);

  const persistSetting = async (key, value) => {
    await AsyncStorage.setItem(key, String(value));
  };

  const refreshTimerRef = useRef(null);

  const increment = () => {
    if (!selectedDhikrId) return;

    setDhikrs((prev) =>
      prev.map((d) =>
        d.id === selectedDhikrId
          ? { ...d, current_count: d.current_count + 1, total_count: d.total_count + 1 }
          : d
      )
    );
    setStats((prev) => ({
      ...prev,
      today: prev.today + 1,
      weekly: prev.weekly + 1,
      monthly: prev.monthly + 1,
      lifetime: prev.lifetime + 1,
    }));

    if (vibrationOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (soundOn) tickSoundRef.current?.replayAsync().catch(() => null);

    incrementDhikrCount(selectedDhikrId).then(() => {
      const sel = dhikrs.find((d) => d.id === selectedDhikrId);
      pushWidgetState({ count: (sel?.current_count || 0) + 1, dhikr: sel?.name || '' }).catch(() => null);
    }).catch(() => null);

    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => refreshData(), 2000);
  };

  const resetCurrent = async () => {
    if (!selectedDhikrId) return;
    await resetCurrentDhikrCount(selectedDhikrId);
    await refreshData();
  };

  const addDhikrItem = async (payload) => {
    await addDhikr(payload);
    await refreshData();
  };

  const updateDhikrItem = async (payload) => {
    await updateDhikr(payload);
    await refreshData();
  };

  const deleteDhikrItem = async (id) => {
    await deleteDhikr(id);
    await refreshData();
  };

  const maybeAutoReset = async () => {
    if (!autoReset) return;
    await resetAllDailyCounts();
    await refreshData();
  };

  const setNotificationsOn = async (enable) => {
    if (!enable) {
      await cancelPrayerNotifications();
      setNotificationsOnState(false);
      await persistSetting('notificationsOn', false);
      return;
    }

    const notifStatus = await requestNotificationPermission();
    if (notifStatus !== 'granted') {
      Alert.alert(t.notifPermTitle, t.notifPermBody);
      return;
    }

    let locStatus = (await Location.getForegroundPermissionsAsync()).status;
    if (locStatus !== 'granted') {
      locStatus = (await Location.requestForegroundPermissionsAsync()).status;
    }
    if (locStatus !== 'granted') {
      Alert.alert(t.notifPermTitle, t.notifLocationNeeded);
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { timings, hijri } = await fetchTodayTimings(position.coords);
      await schedulePrayerNotifications({
        timings,
        hijri,
        labels: {
          names: { Fajr: t.fajr, Dhuhr: t.dhuhr, Asr: t.asr, Maghrib: t.maghrib, Isha: t.isha },
          suhoor: t.suhoorEnds,
          iftar: t.iftarTime,
        },
        bodyTemplate: t.prayerReminderBody,
      });
      setNotificationsOnState(true);
      await persistSetting('notificationsOn', true);
    } catch (e) {
      Alert.alert(t.notifPermTitle, t.notifScheduleError);
    }
  };

  const completeOnboarding = async () => {
    setOnboardingDone(true);
    await persistSetting('onboardingDone', true);
  };

  const setDhikrReminderOn = async (enable) => {
    if (!enable) {
      await cancelEngagementReminders();
      setDhikrReminderOnState(false);
      await persistSetting('dhikrReminderOn', false);
      return;
    }

    const notifStatus = await requestNotificationPermission();
    if (notifStatus !== 'granted') {
      Alert.alert(t.notifPermTitle, t.dhikrReminderPermBody);
      return;
    }

    setDhikrReminderOnState(true);
    await persistSetting('dhikrReminderOn', true);
  };

  const value = {
    loading,
    onboardingDone,
    completeOnboarding,
    t,
    language,
    setLanguage: async (code) => { setLanguage(code); await persistSetting('language', code); },
    theme,
    colors,
    darkMode,
    setDarkMode: async (v) => { setDarkMode(v); await persistSetting('darkMode', v); },
    themeId,
    setThemeId: async (v) => { setThemeId(v); await persistSetting('themeId', v); },
    bgThemeId,
    setBgThemeId: async (v) => { setBgThemeId(v); await persistSetting('bgThemeId', v); },
    soundOn,
    setSoundOn: async (v) => { setSoundOn(v); await persistSetting('soundOn', v); },
    vibrationOn,
    setVibrationOn: async (v) => { setVibrationOn(v); await persistSetting('vibrationOn', v); },
    autoReset,
    setAutoReset: async (v) => { setAutoReset(v); await persistSetting('autoReset', v); },
    premium,
    setPremium: async (v) => { setPremium(v); await persistSetting('premium', v); },
    notificationsOn,
    setNotificationsOn,
    dhikrReminderOn,
    setDhikrReminderOn,
    dhikrs,
    selectedDhikrId,
    setSelectedDhikrId,
    selectedDhikr: dhikrs.find((d) => d.id === selectedDhikrId),
    stats,
    increment,
    resetCurrent,
    refreshData,
    addDhikrItem,
    updateDhikrItem,
    deleteDhikrItem,
    maybeAutoReset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
