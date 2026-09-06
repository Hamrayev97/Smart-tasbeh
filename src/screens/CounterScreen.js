import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useApp } from '../hooks/useAppContext';
import GoalProgress from '../components/GoalProgress';
import PrayerDhikrModal from '../components/PrayerDhikrModal';
import DhikrSelectorModal from '../components/DhikrSelectorModal';
import { getCounterBackground } from '../theme/counterBackgrounds';

export default function CounterScreen() {
  const { loading, t, colors, theme, selectedDhikr, selectedDhikrId, dhikrs, setSelectedDhikrId, increment, resetCurrent, stats, bgThemeId, volumeButtonOn, soundOn, vibrationOn, addDhikrItem, language } = useApp();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
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
  const current = selectedDhikr?.current_count || 0;
  const target = selectedDhikr?.target || 33;
  const goalReached = current >= target;
  const circleSize = screenWidth * 0.42;

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
    <View style={{ flex: 1 }}>
      {/* Full-screen background image */}
      <Image
        source={bg.image}
        style={{ position: 'absolute', top: 0, left: 0, width: screenWidth, height: screenHeight }}
        resizeMode="cover"
      />
      {/* Dark overlay for readability */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: screenWidth, height: screenHeight, backgroundColor: 'rgba(0,0,0,0.15)' }} />

      <View style={{ flex: 1 }}>
        {/* Top section: dhikr name chip + action buttons */}
        <View style={{ paddingTop: Platform.OS === 'ios' ? 50 : 8, paddingHorizontal: 16, zIndex: 10 }}>
          {/* Dhikr selector */}
          <Pressable
            onPress={() => setDhikrSelectorOn(true)}
            style={{ alignSelf: 'center', alignItems: 'center', maxWidth: screenWidth * 0.85, marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingVertical: 8, paddingLeft: 16, paddingRight: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 }}>
                {selectedDhikr?.name || t.currentDhikr}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </View>
            {selectedDhikr?.latin ? (
              <Text style={{ color: '#fff', fontSize: 13, marginTop: 4, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }} numberOfLines={2}>
                {selectedDhikr.latin}
              </Text>
            ) : selectedDhikr?.arabic ? (
              <Text style={{ color: '#fff', fontSize: 13, marginTop: 4, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }} numberOfLines={2}>
                {selectedDhikr.arabic}
              </Text>
            ) : null}
          </Pressable>

          {/* Prayer dhikr & tap anywhere buttons — at top */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Pressable
              onPress={() => setPrayerDhikrOn(true)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(10,61,10,0.75)', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <Ionicons name="moon-outline" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>{t.prayerDhikr}</Text>
            </Pressable>
            <Pressable
              onPress={() => setTapAnywhereOn(true)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <Ionicons name="lock-open-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>{t.enableTapAnywhere}</Text>
            </Pressable>
          </View>
        </View>

        {/* Spacer pushes counter toward bottom */}
        <View style={{ flex: 1 }} />

        {/* Counter area — positioned low for thumb reach */}
        <View style={{ alignItems: 'center', paddingBottom: 12 }}>
          {/* Daily stats row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: '#fff', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 4 }}>
              {t.dailyCount}: <Text style={{ fontWeight: '700' }}>{stats.today}</Text>
            </Text>
            {stats.currentStreak > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8 }}>
                <Ionicons name="flame" size={13} color={stats.currentStreak >= 7 ? '#ff6b00' : '#f59e0b'} />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, marginLeft: 3 }}>{stats.currentStreak}</Text>
              </View>
            )}
          </View>

          {/* Main counter button */}
          <Pressable onPress={handlePress} style={{ width: circleSize, height: circleSize, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={{
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: 'rgba(10,61,10,0.65)',
              borderWidth: 3,
              borderColor: 'rgba(180,160,80,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Text style={{ color: '#fff', fontSize: circleSize * 0.28, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}>
                {current}
              </Text>
              <Text style={{ color: '#eafff6', fontWeight: '700', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}>{t.increment}</Text>
            </Animated.View>
          </Pressable>

          {/* Small reset icon below counter */}
          <Pressable
            onPress={resetCurrent}
            style={{
              marginTop: 12,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(0,0,0,0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* Goal progress */}
          <View style={{ width: screenWidth - 32, marginTop: 10 }}>
            <GoalProgress current={current} target={target} colors={colors} t={t} goalReached={goalReached} />
          </View>
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
        language={language}
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
