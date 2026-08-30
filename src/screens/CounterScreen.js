import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useApp } from '../hooks/useAppContext';
import GoalProgress from '../components/GoalProgress';
import AdBanner from '../components/AdBanner';
import PrayerDhikrModal from '../components/PrayerDhikrModal';
import DhikrSelectorModal from '../components/DhikrSelectorModal';
import { getCounterBackground } from '../theme/counterBackgrounds';

function getStreakMessage(streak, t) {
  if (streak >= 100) return t.streakLegendary;
  if (streak >= 30) return t.streakIncredible;
  if (streak >= 7) return t.streakAmazing;
  if (streak >= 3) return t.streakGreat;
  return t.streakKeepGoing;
}

export default function CounterScreen() {
  const { loading, t, colors, theme, selectedDhikr, dhikrs, setSelectedDhikrId, increment, resetCurrent, stats, bgThemeId, volumeButtonOn, soundOn, vibrationOn, addDhikrItem } = useApp();
  const { width: screenWidth } = useWindowDimensions();
  const scale = useRef(new Animated.Value(1)).current;
  const [tapAnywhereOn, setTapAnywhereOn] = useState(false);
  const [prayerDhikrOn, setPrayerDhikrOn] = useState(false);
  const [dhikrSelectorOn, setDhikrSelectorOn] = useState(false);
  useKeepAwake();
  const resettingVolume = useRef(false);
  const incrementRef = useRef(increment);
  incrementRef.current = increment;

  useEffect(() => {
    if (!volumeButtonOn || Platform.OS === 'web') return;
    let listener;
    try {
      const { VolumeManager } = require('react-native-volume-manager');
      VolumeManager.showNativeVolumeUI({ enabled: false });
      VolumeManager.setVolume(0.5, { showUI: false });

      listener = VolumeManager.addVolumeListener((result) => {
        if (resettingVolume.current) return;
        resettingVolume.current = true;
        incrementRef.current();
        Animated.sequence([
          Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        VolumeManager.setVolume(0.5, { showUI: false });
        setTimeout(() => { resettingVolume.current = false; }, 200);
      });
    } catch (_) {}

    return () => {
      listener?.remove();
      try {
        const { VolumeManager } = require('react-native-volume-manager');
        VolumeManager.showNativeVolumeUI({ enabled: true });
      } catch (_) {}
    };
  }, [volumeButtonOn]);

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  const bg = getCounterBackground(bgThemeId);
  const imageHeight = screenWidth / bg.aspect;
  const circleSize = screenWidth * bg.circleDiameterFrac;
  const circleLeft = screenWidth * bg.circleCenterXFrac - circleSize / 2;
  const circleTop = imageHeight * bg.circleCenterYFrac - circleSize / 2;
  const current = selectedDhikr?.current_count || 0;
  const target = selectedDhikr?.target || 33;
  const goalReached = current >= target;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    increment();
  };

  const handleAddRecommended = async (payload) => {
    await addDhikrItem(payload);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <AdBanner />

        <View style={{ width: screenWidth, height: imageHeight }}>
          <Image source={bg.image} style={{ width: screenWidth, height: imageHeight, position: 'absolute' }} resizeMode="contain" />

          <Pressable
            onPress={() => setDhikrSelectorOn(true)}
            style={{
              position: 'absolute',
              top: imageHeight * bg.chipsTopFrac + 4,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.45)',
              borderRadius: 20,
              paddingVertical: 8,
              paddingLeft: 16,
              paddingRight: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 }}>
              {selectedDhikr?.name || t.currentDhikr}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </Pressable>

          <Pressable
            onPress={handlePress}
            style={{ position: 'absolute', left: circleLeft, top: circleTop, width: circleSize, height: circleSize, alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
              <Text style={{ color: '#fff', fontSize: circleSize * 0.26, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}>
                {current}
              </Text>
              <Text style={{ color: '#eafff6', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}>{t.increment}</Text>
            </Animated.View>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t.dailyCount}: <Text style={{ color: colors.text, fontWeight: '700' }}>{stats.today}</Text></Text>
              {stats.currentStreak > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, backgroundColor: stats.currentStreak >= 7 ? '#ff6b0015' : colors.surface, borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8 }}>
                  <Ionicons name="flame" size={13} color={stats.currentStreak >= 7 ? '#ff6b00' : '#f59e0b'} />
                  <Text style={{ color: stats.currentStreak >= 7 ? '#ff6b00' : colors.text, fontWeight: '800', fontSize: 13, marginLeft: 3 }}>{stats.currentStreak}</Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={resetCurrent}
              style={{ backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14 }}
            >
              <Text style={{ color: '#2e2814', fontWeight: '700', fontSize: 13 }}>{t.reset}</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <Pressable
              onPress={() => setPrayerDhikrOn(true)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <Ionicons name="moon-outline" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>{t.prayerDhikr}</Text>
            </Pressable>
            <Pressable
              onPress={() => setTapAnywhereOn(true)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <Ionicons name="lock-open-outline" size={14} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600', marginLeft: 4, fontSize: 12 }}>{t.enableTapAnywhere}</Text>
            </Pressable>
          </View>

          <GoalProgress current={current} target={target} colors={colors} t={t} goalReached={goalReached} />
        </View>
      </View>

      <DhikrSelectorModal
        visible={dhikrSelectorOn}
        onClose={() => setDhikrSelectorOn(false)}
        dhikrs={dhikrs}
        selectedId={selectedDhikrId}
        onSelect={setSelectedDhikrId}
        onAdd={handleAddRecommended}
        theme={theme}
        colors={colors}
        t={t}
      />

      <PrayerDhikrModal
        visible={prayerDhikrOn}
        onClose={() => setPrayerDhikrOn(false)}
        theme={theme}
        colors={colors}
        t={t}
        vibrationOn={vibrationOn}
        soundOn={soundOn}
      />

      {tapAnywhereOn && (
        <Pressable
          onPress={handlePress}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.Text style={{ fontSize: 72, fontWeight: '800', color: theme.primary, transform: [{ scale }] }}>
            {current}
          </Animated.Text>
          <Text style={{ color: '#2e2e2e', fontWeight: '600', marginTop: 8, fontSize: 15 }}>{t.tapAnywhereHint}</Text>

          <Pressable
            onPress={() => setTapAnywhereOn(false)}
            accessibilityLabel={t.tapAnywhereHint}
            style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#fff', borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 }}
          >
            <Ionicons name="lock-closed" size={22} color={theme.primary} />
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}
