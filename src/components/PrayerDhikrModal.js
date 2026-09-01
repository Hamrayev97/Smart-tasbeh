import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const SEQUENCE = [
  { arabic: 'سُبْحَانَ اللّٰهِ', latin: 'SubhanAllah', target: 33 },
  { arabic: 'اَلْحَمْدُ لِلّٰهِ', latin: 'Alhamdulillah', target: 33 },
  { arabic: 'اَللّٰهُ أَكْبَرُ', latin: 'Allahu Akbar', target: 33 },
];

export default function PrayerDhikrModal({ visible, onClose, theme, colors, t, vibrationOn, soundOn }) {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const tickRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    Audio.Sound.createAsync(require('../../assets/tick.wav'))
      .then(({ sound }) => { if (mounted) tickRef.current = sound; else sound.unloadAsync(); })
      .catch(() => null);
    return () => { mounted = false; tickRef.current?.unloadAsync(); tickRef.current = null; };
  }, [visible]);

  if (!visible) return null;

  const current = SEQUENCE[step];
  const total = SEQUENCE.length;

  const handleTap = () => {
    if (done) return;

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    if (vibrationOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (soundOn) tickRef.current?.replayAsync().catch(() => null);

    const next = count + 1;
    if (next >= current.target) {
      if (vibrationOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (step + 1 < total) {
        setStep(step + 1);
        setCount(0);
      } else {
        setDone(true);
      }
    } else {
      setCount(next);
    }
  };

  const handleClose = () => {
    setStep(0);
    setCount(0);
    setDone(false);
    onClose();
  };

  const handleRestart = () => {
    setStep(0);
    setCount(0);
    setDone(false);
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.background, zIndex: 100 }}>
      <Pressable
        onPress={handleClose}
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, backgroundColor: colors.surface, borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
      >
        <Ionicons name="close" size={22} color={colors.text} />
      </Pressable>

      {done ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Ionicons name="checkmark-circle" size={80} color={theme.primary} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 16 }}>{t.prayerDhikrDone}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>{t.prayerDhikrDoneDesc}</Text>
          <Pressable onPress={handleRestart} style={{ marginTop: 24, backgroundColor: theme.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t.reset}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={handleTap} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          {/* Step dots */}
          <View style={{ flexDirection: 'row', marginBottom: 24 }}>
            {SEQUENCE.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 24 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i < step ? theme.primary : i === step ? theme.primary : colors.border,
                  marginHorizontal: 4,
                  opacity: i <= step ? 1 : 0.4,
                }}
              />
            ))}
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
            {step + 1} / {total}
          </Text>

          <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
            <Text style={{ color: colors.text, fontSize: 36, fontWeight: '700', textAlign: 'center', lineHeight: 52 }}>
              {current.arabic}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: 4 }}>
              {current.latin}
            </Text>
          </Animated.View>

          <Text style={{ color: theme.primary, fontSize: 64, fontWeight: '800', marginTop: 24 }}>
            {count}
          </Text>
          <View style={{ width: 200, height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 12 }}>
            <View style={{ width: (count / current.target) * 200, height: 4, backgroundColor: theme.primary, borderRadius: 2 }} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
            {count} / {current.target}
          </Text>

          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 32 }}>{t.tapAnywhereHint}</Text>
        </Pressable>
      )}
    </View>
  );
}
