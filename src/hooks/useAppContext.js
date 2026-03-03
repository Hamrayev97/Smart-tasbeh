import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { getTranslation } from '../localization';
import { themes } from '../theme/themes';
import { pushWidgetState } from '../widgetSync';
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
  const [language, setLanguage] = useState('en');
  const [themeId, setThemeId] = useState('emerald');
  const [darkMode, setDarkMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [autoReset, setAutoReset] = useState(false);
  const [premium, setPremium] = useState(false);
  const [dhikrs, setDhikrs] = useState([]);
  const [selectedDhikrId, setSelectedDhikrId] = useState(null);
  const [stats, setStats] = useState({ today: 0, weekly: 0, monthly: 0, lifetime: 0, mostRecited: '-', weeklySeries: [], monthlySeries: [] });

  const t = useMemo(() => getTranslation(language), [language]);
  const theme = themes[themeId] || themes.emerald;
  const colors = darkMode ? themes.night : theme;

  const hydrate = async () => {
    await initDatabase();
    const saved = await AsyncStorage.multiGet(['language', 'themeId', 'darkMode', 'soundOn', 'vibrationOn', 'autoReset', 'premium']);
    const map = Object.fromEntries(saved);
    if (map.language) setLanguage(map.language);
    if (map.themeId) setThemeId(map.themeId);
    setDarkMode(map.darkMode === 'true');
    setSoundOn(map.soundOn !== 'false');
    setVibrationOn(map.vibrationOn !== 'false');
    setAutoReset(map.autoReset === 'true');
    setPremium(map.premium === 'true');

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

  const persistSetting = async (key, value) => {
    await AsyncStorage.setItem(key, String(value));
  };

  const increment = async () => {
    if (!selectedDhikrId) return;
    await incrementDhikrCount(selectedDhikrId);
    if (vibrationOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshData();

    const selected = dhikrs.find((item) => item.id === selectedDhikrId);
    if (selected && selected.current_count + 1 >= selected.target) {
      Alert.alert(t.goalReached, t.congratsMessage);
    }
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

  const value = {
    loading,
    t,
    language,
    setLanguage: async (code) => { setLanguage(code); await persistSetting('language', code); },
    theme,
    colors,
    darkMode,
    setDarkMode: async (v) => { setDarkMode(v); await persistSetting('darkMode', v); },
    themeId,
    setThemeId: async (v) => { setThemeId(v); await persistSetting('themeId', v); },
    soundOn,
    setSoundOn: async (v) => { setSoundOn(v); await persistSetting('soundOn', v); },
    vibrationOn,
    setVibrationOn: async (v) => { setVibrationOn(v); await persistSetting('vibrationOn', v); },
    autoReset,
    setAutoReset: async (v) => { setAutoReset(v); await persistSetting('autoReset', v); },
    premium,
    setPremium: async (v) => { setPremium(v); await persistSetting('premium', v); },
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
