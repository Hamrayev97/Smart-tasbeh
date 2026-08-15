import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useApp } from '../hooks/useAppContext';
import GoalProgress from '../components/GoalProgress';
import AdBanner from '../components/AdBanner';

const BG_IMAGE = require('../../assets/counter-background.png');
const BG_ASPECT = 941 / 1672;

// Fraction of the background image's own size/position where its painted
// circle sits, measured from the artwork so the tappable area lines up with it.
const CIRCLE_DIAMETER_FRAC = 0.549;
const CIRCLE_CENTER_X_FRAC = 0.499;
const CIRCLE_CENTER_Y_FRAC = 0.602;

export default function CounterScreen() {
  const { loading, t, colors, theme, selectedDhikr, dhikrs, setSelectedDhikrId, increment, resetCurrent, stats } = useApp();
  const { width: screenWidth } = useWindowDimensions();
  const scale = useRef(new Animated.Value(1)).current;

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  const imageHeight = screenWidth / BG_ASPECT;
  const circleSize = screenWidth * CIRCLE_DIAMETER_FRAC;
  const circleLeft = screenWidth * CIRCLE_CENTER_X_FRAC - circleSize / 2;
  const circleTop = imageHeight * CIRCLE_CENTER_Y_FRAC - circleSize / 2;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    increment();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={{ width: screenWidth, height: imageHeight }}>
        <Image source={BG_IMAGE} style={{ width: screenWidth, height: imageHeight, position: 'absolute' }} resizeMode="contain" />

        <View style={{ position: 'absolute', top: imageHeight * 0.03, left: 0, right: 0 }}>
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
              {selectedDhikr?.current_count || 0}
            </Text>
            <Text style={{ color: '#eafff6', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}>{t.increment}</Text>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={resetCurrent}
          style={{
            position: 'absolute',
            left: screenWidth / 2 - 60,
            top: circleTop + circleSize + 16,
            width: 120,
            alignItems: 'center',
            backgroundColor: theme.accent,
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: '#2e2814', fontWeight: '700' }}>{t.reset}</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ marginTop: 12, color: colors.textMuted, textAlign: 'center' }}>{t.dailyCount}: <Text style={{ color: colors.text, fontWeight: '700' }}>{stats.today}</Text></Text>

        <GoalProgress current={selectedDhikr?.current_count || 0} target={selectedDhikr?.target || 33} colors={colors} t={t} />

        <AdBanner />
      </View>
    </ScrollView>
  );
}
