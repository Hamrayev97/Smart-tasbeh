import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import GoalProgress from '../components/GoalProgress';
import AdBanner from '../components/AdBanner';
import { getCounterBackground } from '../theme/counterBackgrounds';

const MIN_SPACE_FOR_OVERLAID_RESET = 70;

export default function CounterScreen() {
  const { loading, t, colors, theme, selectedDhikr, dhikrs, setSelectedDhikrId, increment, resetCurrent, stats, bgThemeId } = useApp();
  const { width: screenWidth } = useWindowDimensions();
  const scale = useRef(new Animated.Value(1)).current;
  const [tapAnywhereOn, setTapAnywhereOn] = useState(false);

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  const bg = getCounterBackground(bgThemeId);
  const imageHeight = screenWidth / bg.aspect;
  const circleSize = screenWidth * bg.circleDiameterFrac;
  const circleLeft = screenWidth * bg.circleCenterXFrac - circleSize / 2;
  const circleTop = imageHeight * bg.circleCenterYFrac - circleSize / 2;
  const circleBottom = circleTop + circleSize;
  const spaceBelowCircle = imageHeight - circleBottom;
  const resetOverlaid = spaceBelowCircle > MIN_SPACE_FOR_OVERLAID_RESET;

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

  const ResetButton = (
    <Pressable
      onPress={resetCurrent}
      style={
        resetOverlaid
          ? { position: 'absolute', left: screenWidth / 2 - 60, top: circleBottom + 16, width: 120, alignItems: 'center', backgroundColor: theme.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }
          : { alignSelf: 'center', marginTop: 12, backgroundColor: theme.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }
      }
    >
      <Text style={{ color: '#2e2814', fontWeight: '700' }}>{t.reset}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Small banner at top */}
      <AdBanner size="BANNER" compact />
      {/* Main content — no scroll */}
      <View style={{ flex: 1 }}>
        <View style={{ width: screenWidth, height: imageHeight }}>
          <Image source={bg.image} style={{ width: screenWidth, height: imageHeight, position: 'absolute' }} resizeMode="contain" />

          <View style={{ position: 'absolute', top: imageHeight * bg.chipsTopFrac, left: 0, right: 0 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 5 }}>{t.currentDhikr}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ marginTop: 8 }}>
              {dhikrs.map((dhikr) => (
                <Pressable
                  key={dhikr.id}
                  onPress={() => setSelectedDhikrId(dhikr.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: selectedDhikr?.id === dhikr.id ? theme.primary : 'rgba(255,255,255,0.45)',
                    borderWidth: 1,
                    borderColor: selectedDhikr?.id === dhikr.id ? theme.primary : 'rgba(255,255,255,0.8)',
                  }}
                >
                  <Text style={{ color: selectedDhikr?.id === dhikr.id ? '#fff' : '#1f2d27', fontWeight: '600' }}>{dhikr.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

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

          {resetOverlaid && ResetButton}
        </View>

        {!resetOverlaid && ResetButton}

        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13 }}>{t.dailyCount}: <Text style={{ color: colors.text, fontWeight: '700' }}>{stats.today}</Text></Text>
            <Pressable
              onPress={() => setTapAnywhereOn(true)}
              accessibilityLabel={t.enableTapAnywhere}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 5, paddingHorizontal: 10, marginLeft: 12 }}
            >
              <Ionicons name="lock-open-outline" size={14} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600', marginLeft: 4, fontSize: 12 }}>{t.enableTapAnywhere}</Text>
            </Pressable>
          </View>
          <GoalProgress current={current} target={target} colors={colors} t={t} goalReached={goalReached} />
        </View>
      </View>

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
