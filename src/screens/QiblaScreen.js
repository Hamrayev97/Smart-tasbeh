import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';
import Svg, { Circle, Line, Text as SvgText, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import usePrayerTimes from '../hooks/usePrayerTimes';
import LocationPermissionGate from '../components/LocationPermissionGate';

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;
const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

const calculateQiblaBearing = (lat, lon) => {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LON - lon);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatTime = (t) => (t ? t.split(' ')[0] : '');

const nextPrayerKey = (timings) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const key of PRAYER_KEYS) {
    const [h, m] = formatTime(timings[key]).split(':').map(Number);
    if (h * 60 + m > nowMinutes) return key;
  }
  return PRAYER_KEYS[0];
};

const COMPASS_SIZE = Math.min(Dimensions.get('window').width - 40, 320);
const CENTER = COMPASS_SIZE / 2;
const OUTER_R = CENTER - 4;
const TICK_OUTER = OUTER_R - 2;
const TICK_INNER_MAJOR = TICK_OUTER - 18;
const TICK_INNER_MINOR = TICK_OUTER - 10;
const LABEL_R = TICK_INNER_MAJOR - 16;
const DEGREE_TICK_R = TICK_OUTER - 6;

const CARDINALS = [
  { angle: 0, label: 'N', isNorth: true },
  { angle: 90, label: 'E', isNorth: false },
  { angle: 180, label: 'S', isNorth: false },
  { angle: 270, label: 'W', isNorth: false },
];

const INTERCARDINALS = [
  { angle: 45, label: 'NE' },
  { angle: 135, label: 'SE' },
  { angle: 225, label: 'SW' },
  { angle: 315, label: 'NW' },
];

function CompassRose({ rotation, qiblaBearing, darkMode, primaryColor }) {
  const bgColor = darkMode ? '#1a1a2e' : '#f0f4f0';
  const ringColor = darkMode ? '#2a2a3e' : '#e0e8e0';
  const tickColor = darkMode ? '#8a8aa0' : '#6b7b6b';
  const textColor = darkMode ? '#e0e0e0' : '#333333';
  const innerBg = darkMode ? '#12122a' : '#fafcfa';

  return (
    <Svg width={COMPASS_SIZE} height={COMPASS_SIZE} viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}>
      <Defs>
        <LinearGradient id="outerRing" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primaryColor} stopOpacity="1" />
          <Stop offset="1" stopColor={darkMode ? '#0a5a3a' : '#0a8a4a'} stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="qiblaArrow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD700" stopOpacity="1" />
          <Stop offset="1" stopColor="#FF8C00" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      <Circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="none" stroke="url(#outerRing)" strokeWidth={6} />
      <Circle cx={CENTER} cy={CENTER} r={OUTER_R - 6} fill={bgColor} stroke={ringColor} strokeWidth={1} />
      <Circle cx={CENTER} cy={CENTER} r={OUTER_R - 28} fill={innerBg} stroke={ringColor} strokeWidth={0.5} />

      <G rotation={-rotation} origin={`${CENTER}, ${CENTER}`}>
        {Array.from({ length: 72 }, (_, i) => {
          const angle = i * 5;
          const isMajor = angle % 30 === 0;
          const rad = toRad(angle - 90);
          const outerX = CENTER + TICK_OUTER * Math.cos(rad);
          const outerY = CENTER + TICK_OUTER * Math.sin(rad);
          const innerR = isMajor ? TICK_INNER_MAJOR : (angle % 10 === 0 ? DEGREE_TICK_R : TICK_INNER_MINOR);
          const innerX = CENTER + innerR * Math.cos(rad);
          const innerY = CENTER + innerR * Math.sin(rad);
          return (
            <Line key={`tick-${i}`} x1={outerX} y1={outerY} x2={innerX} y2={innerY}
              stroke={isMajor ? textColor : tickColor} strokeWidth={isMajor ? 2 : 0.8} />
          );
        })}

        {Array.from({ length: 24 }, (_, i) => {
          const angle = i * 15;
          const rad = toRad(angle - 90);
          const dotR = OUTER_R - 1;
          return (
            <Circle key={`dot-${i}`} cx={CENTER + dotR * Math.cos(rad)} cy={CENTER + dotR * Math.sin(rad)}
              r={2} fill={primaryColor} opacity={0.6} />
          );
        })}

        {CARDINALS.map(({ angle, label, isNorth }) => {
          const rad = toRad(angle - 90);
          return (
            <SvgText key={label} x={CENTER + LABEL_R * Math.cos(rad)} y={CENTER + LABEL_R * Math.sin(rad)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={isNorth ? 22 : 18} fontWeight="bold" fill={isNorth ? '#E53E3E' : textColor}>
              {label}
            </SvgText>
          );
        })}

        {INTERCARDINALS.map(({ angle, label }) => {
          const rad = toRad(angle - 90);
          return (
            <SvgText key={label} x={CENTER + (LABEL_R - 4) * Math.cos(rad)} y={CENTER + (LABEL_R - 4) * Math.sin(rad)}
              textAnchor="middle" alignmentBaseline="central" fontSize={11} fontWeight="600" fill={tickColor}>
              {label}
            </SvgText>
          );
        })}

        <Path d={`M ${CENTER} ${CENTER - OUTER_R + 10} L ${CENTER - 7} ${CENTER - OUTER_R + 24} L ${CENTER + 7} ${CENTER - OUTER_R + 24} Z`}
          fill="#E53E3E" />

        {qiblaBearing !== null && (() => {
          const rad = toRad(qiblaBearing - 90);
          const indicatorR = OUTER_R - 16;
          const mosqueR = LABEL_R - 30;
          return (
            <G>
              <Line x1={CENTER} y1={CENTER}
                x2={CENTER + (OUTER_R - 30) * Math.cos(rad)} y2={CENTER + (OUTER_R - 30) * Math.sin(rad)}
                stroke="url(#qiblaArrow)" strokeWidth={2.5} strokeDasharray="6,4" opacity={0.7} />
              <Circle cx={CENTER + indicatorR * Math.cos(rad)} cy={CENTER + indicatorR * Math.sin(rad)}
                r={10} fill="#FFD700" opacity={0.2} />
              <SvgText x={CENTER + indicatorR * Math.cos(rad)} y={CENTER + indicatorR * Math.sin(rad)}
                textAnchor="middle" alignmentBaseline="central" fontSize={16}>🕋</SvgText>
              <SvgText x={CENTER + mosqueR * Math.cos(rad)} y={CENTER + mosqueR * Math.sin(rad)}
                textAnchor="middle" alignmentBaseline="central" fontSize={26}>🕋</SvgText>
            </G>
          );
        })()}
      </G>

      <Circle cx={CENTER} cy={CENTER} r={12} fill={primaryColor} />
      <Circle cx={CENTER} cy={CENTER} r={8} fill={darkMode ? '#1a1a2e' : '#ffffff'} />
      <Circle cx={CENTER} cy={CENTER} r={4} fill={primaryColor} />
    </Svg>
  );
}

function getDirectionLabel(bearing) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(bearing / 45) % 8];
}

let MapView, Marker, Polyline;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
  } catch (e) {
    MapView = null;
  }
}

class MapErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ marginHorizontal: 20, borderRadius: 16, padding: 24, alignItems: 'center', backgroundColor: this.props.surfaceColor, borderWidth: 1, borderColor: this.props.borderColor }}>
          <Ionicons name="map-outline" size={40} color={this.props.mutedColor} />
          <Text style={{ color: this.props.mutedColor, marginTop: 10, textAlign: 'center', fontSize: 13 }}>
            {this.props.fallbackText}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function buildGreatCircle(lat1, lon1, lat2, lon2, numPoints) {
  const phi1 = toRad(lat1), lam1 = toRad(lon1);
  const phi2 = toRad(lat2), lam2 = toRad(lon2);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((phi2 - phi1) / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin((lam2 - lam1) / 2) ** 2
  ));
  if (d < 1e-10) return [{ latitude: lat1, longitude: lon1 }];
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x = a * Math.cos(phi1) * Math.cos(lam1) + b * Math.cos(phi2) * Math.cos(lam2);
    const y = a * Math.cos(phi1) * Math.sin(lam1) + b * Math.cos(phi2) * Math.sin(lam2);
    const z = a * Math.sin(phi1) + b * Math.sin(phi2);
    points.push({ latitude: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), longitude: toDeg(Math.atan2(y, x)) });
  }
  return points;
}

function QiblaMapView({ coords, darkMode, primaryColor, colors }) {
  if (!MapView || !coords) return null;

  const userLat = coords.latitude;
  const userLon = coords.longitude;
  const midLat = (userLat + KAABA_LAT) / 2;
  const midLon = (userLon + KAABA_LON) / 2;
  const latDelta = Math.abs(userLat - KAABA_LAT) * 1.5;
  const lonDelta = Math.abs(userLon - KAABA_LON) * 1.5;
  const distance = calculateDistance(userLat, userLon, KAABA_LAT, KAABA_LON);
  const { width: screenWidth } = Dimensions.get('window');
  const mapHeight = screenWidth * 1.1;
  const points = buildGreatCircle(userLat, userLon, KAABA_LAT, KAABA_LON, 50);

  return (
    <View style={{ marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', elevation: 4 }}>
      <MapView
        style={{ width: screenWidth - 40, height: mapHeight }}
        initialRegion={{
          latitude: midLat,
          longitude: midLon,
          latitudeDelta: Math.max(latDelta, 5),
          longitudeDelta: Math.max(lonDelta, 5),
        }}
        mapType="standard"
      >
        <Marker
          coordinate={{ latitude: userLat, longitude: userLon }}
          title="You"
          pinColor={primaryColor}
        />
        <Marker
          coordinate={{ latitude: KAABA_LAT, longitude: KAABA_LON }}
          title="Kaaba"
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28 }}>🕋</Text>
          </View>
        </Marker>
        <Polyline
          coordinates={points}
          strokeColor="#2196F3"
          strokeWidth={3}
          lineDashPattern={[10, 6]}
        />
      </MapView>

      <View style={{
        position: 'absolute', bottom: 12, left: 12, right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: 10,
        flexDirection: 'row', alignItems: 'center',
      }}>
        <Ionicons name="navigate" size={20} color="#2196F3" />
        <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8, flex: 1 }}>
          {Math.round(distance).toLocaleString()} km
        </Text>
        <Text style={{ fontSize: 18 }}>🕋</Text>
      </View>
    </View>
  );
}

export default function QiblaScreen() {
  const { t, colors, theme, darkMode } = useApp();
  const { status, coords, timings, requestPermission } = usePrayerTimes();
  const [heading, setHeading] = useState(null);
  const [viewMode, setViewMode] = useState('compass');
  const headingSubRef = useRef(null);
  const smoothedRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Location.watchHeadingAsync((h) => {
        const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
        if (smoothedRef.current === null) {
          smoothedRef.current = raw;
        } else {
          let diff = raw - smoothedRef.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          smoothedRef.current = (smoothedRef.current + diff * 0.3 + 360) % 360;
        }
        setHeading(smoothedRef.current);
      })
        .then((sub) => { headingSubRef.current = sub; })
        .catch(() => null);
    }
    return () => headingSubRef.current?.remove();
  }, []);

  if (status !== 'ready') {
    return <LocationPermissionGate status={status} requestPermission={requestPermission} />;
  }

  const qiblaBearing = coords ? calculateQiblaBearing(coords.latitude, coords.longitude) : null;
  const compassRotation = heading || 0;
  const next = timings ? nextPrayerKey(timings) : null;
  const showMapTab = false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Tab switcher */}
      {showMapTab && (
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 10, backgroundColor: colors.surface, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: colors.border }}>
          <Pressable
            onPress={() => setViewMode('compass')}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: viewMode === 'compass' ? theme.primary : 'transparent', alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="compass-outline" size={18} color={viewMode === 'compass' ? '#fff' : colors.textMuted} />
              <Text style={{ color: viewMode === 'compass' ? '#fff' : colors.textMuted, fontWeight: '600', marginLeft: 6 }}>
                {t.qibla}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('map')}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: viewMode === 'map' ? theme.primary : 'transparent', alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="map-outline" size={18} color={viewMode === 'map' ? '#fff' : colors.textMuted} />
              <Text style={{ color: viewMode === 'map' ? '#fff' : colors.textMuted, fontWeight: '600', marginLeft: 6 }}>
                {t.qiblaMap || 'Xarita'}
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
        {viewMode === 'compass' ? (
          <>
            <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
              <CompassRose
                rotation={compassRotation}
                qiblaBearing={qiblaBearing}
                darkMode={darkMode}
                primaryColor={theme.primary}
              />
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Text style={{ color: colors.text, fontSize: 36, fontWeight: '800', letterSpacing: 1 }}>
                  {qiblaBearing !== null ? `${Math.round(qiblaBearing)}°` : '—'}{' '}
                  <Text style={{ fontSize: 22, fontWeight: '600', color: colors.textMuted }}>
                    {qiblaBearing !== null ? getDirectionLabel(qiblaBearing) : ''}
                  </Text>
                </Text>
                <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                  {t.qibla}
                </Text>
              </View>
              {Platform.OS === 'web' && (
                <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 10, marginTop: 8, marginHorizontal: 20 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.qiblaWebNote}</Text>
                </View>
              )}
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 10 }}>{t.prayerTimes}</Text>
              {timings && PRAYER_KEYS.map((key) => {
                const isNext = key === next;
                return (
                  <View key={key} style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: isNext ? theme.primary : colors.surface,
                    borderWidth: 1, borderColor: isNext ? theme.primary : colors.border,
                    borderRadius: 12, padding: 14, marginBottom: 8,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isNext && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 10 }} />}
                      <Text style={{ color: isNext ? '#fff' : colors.text, fontWeight: '600', fontSize: 15 }}>
                        {t[key.toLowerCase()] || key}
                      </Text>
                    </View>
                    <Text style={{ color: isNext ? '#fff' : colors.text, fontWeight: '700', fontSize: 16 }}>
                      {formatTime(timings[key])}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={{ paddingTop: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>
                {qiblaBearing !== null ? `${Math.round(qiblaBearing)}°` : '—'}{' '}
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textMuted }}>
                  {qiblaBearing !== null ? getDirectionLabel(qiblaBearing) : ''}
                </Text>
              </Text>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{t.qibla}</Text>
            </View>

            <MapErrorBoundary surfaceColor={colors.surface} borderColor={colors.border} mutedColor={colors.textMuted} fallbackText={t.locationError}>
              <QiblaMapView coords={coords} darkMode={darkMode} primaryColor={theme.primary} colors={colors} />
            </MapErrorBoundary>

            <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 10 }}>{t.prayerTimes}</Text>
              {timings && PRAYER_KEYS.map((key) => {
                const isNext = key === next;
                return (
                  <View key={key} style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: isNext ? theme.primary : colors.surface,
                    borderWidth: 1, borderColor: isNext ? theme.primary : colors.border,
                    borderRadius: 12, padding: 14, marginBottom: 8,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isNext && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 10 }} />}
                      <Text style={{ color: isNext ? '#fff' : colors.text, fontWeight: '600', fontSize: 15 }}>
                        {t[key.toLowerCase()] || key}
                      </Text>
                    </View>
                    <Text style={{ color: isNext ? '#fff' : colors.text, fontWeight: '700', fontSize: 16 }}>
                      {formatTime(timings[key])}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
