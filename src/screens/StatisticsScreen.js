import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import Svg, { Rect, Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../hooks/useAppContext';
import AdBanner from '../components/AdBanner';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 32;
const BAR_H = 180;
const LINE_H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 36 };

function SimpleBarChart({ data, colors }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = BAR_H - PAD.top - PAD.bottom;
  const barW = Math.min(plotW / data.length * 0.6, 28);
  const gap = plotW / data.length;

  return (
    <Svg width={CHART_W} height={BAR_H}>
      <Rect x={0} y={0} width={CHART_W} height={BAR_H} rx={12} fill={colors.surface} />
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = PAD.top + plotH * (1 - f);
        return (
          <React.Fragment key={i}>
            <Line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} stroke={colors.border} strokeWidth={0.5} />
            <SvgText x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill={colors.textMuted}>
              {Math.round(max * f)}
            </SvgText>
          </React.Fragment>
        );
      })}
      {data.map((d, i) => {
        const h = (d.count / max) * plotH;
        const x = PAD.left + i * gap + (gap - barW) / 2;
        const y = PAD.top + plotH - h;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={barW} height={h} rx={4} fill="#0f9d79" opacity={0.85} />
            <SvgText x={x + barW / 2} y={BAR_H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill={colors.textMuted}>
              {d.date.slice(5)}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function SimpleLineChart({ data, colors }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = LINE_H - PAD.top - PAD.bottom;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PAD.left + i * stepX,
    y: PAD.top + plotH - (d.count / max) * plotH,
  }));

  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
  } else {
    pathD = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    }, '');
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${PAD.top + plotH} L ${points[0].x} ${PAD.top + plotH} Z`;
  const showEvery = data.length > 15 ? Math.ceil(data.length / 8) : (data.length > 8 ? 2 : 1);

  return (
    <Svg width={CHART_W} height={LINE_H}>
      <Rect x={0} y={0} width={CHART_W} height={LINE_H} rx={12} fill={colors.surface} />
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = PAD.top + plotH * (1 - f);
        return (
          <React.Fragment key={i}>
            <Line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} stroke={colors.border} strokeWidth={0.5} />
            <SvgText x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill={colors.textMuted}>
              {Math.round(max * f)}
            </SvgText>
          </React.Fragment>
        );
      })}
      <Path d={areaD} fill="#0f9d79" opacity={0.12} />
      <Path d={pathD} fill="none" stroke="#0f9d79" strokeWidth={2.5} strokeLinecap="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#0f9d79" />
      ))}
      {data.map((d, i) => {
        if (i % showEvery !== 0 && i !== data.length - 1) return null;
        return (
          <SvgText key={i} x={points[i].x} y={LINE_H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill={colors.textMuted}>
            {d.date.slice(5)}
          </SvgText>
        );
      })}
    </Svg>
  );
}

function Heatmap({ data, colors, primaryColor, t }) {
  const CELL = Math.floor((CHART_W - 30) / 14);
  const GAP = 2;
  const ROWS = 7;
  const COLS = 13;

  const countByDate = {};
  let maxCount = 1;
  data.forEach((d) => {
    countByDate[d.date] = d.count;
    if (d.count > maxCount) maxCount = d.count;
  });

  const today = new Date();
  const todayDay = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (COLS - 1) * 7 - todayDay);

  const cells = [];
  const monthLabels = [];
  let lastMonth = -1;
  const cursor = new Date(startDate);

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (cursor > today) { cursor.setDate(cursor.getDate() + 1); continue; }
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      const count = countByDate[key] || 0;

      let opacity = 0.08;
      if (count > 0) {
        const ratio = count / maxCount;
        if (ratio <= 0.25) opacity = 0.3;
        else if (ratio <= 0.5) opacity = 0.5;
        else if (ratio <= 0.75) opacity = 0.75;
        else opacity = 1;
      }

      cells.push(
        <Rect
          key={key}
          x={28 + col * (CELL + GAP)}
          y={row * (CELL + GAP)}
          width={CELL}
          height={CELL}
          rx={3}
          fill={count > 0 ? primaryColor : colors.border}
          opacity={opacity}
        />
      );

      if (cursor.getMonth() !== lastMonth && cursor.getDate() <= 7) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthLabels.push(
          <SvgText key={`m-${col}`} x={28 + col * (CELL + GAP)} y={ROWS * (CELL + GAP) + 12} fontSize={9} fill={colors.textMuted}>
            {monthNames[cursor.getMonth()]}
          </SvgText>
        );
        lastMonth = cursor.getMonth();
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];
  const svgH = ROWS * (CELL + GAP) + 20;

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>{t.activity}</Text>
      <Svg width={CHART_W - 24} height={svgH}>
        {dayLabels.map((label, i) => (
          label ? <SvgText key={i} x={0} y={i * (CELL + GAP) + CELL / 2 + 4} fontSize={9} fill={colors.textMuted}>{label}</SvgText> : null
        ))}
        {cells}
        {monthLabels}
      </Svg>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
        <Text style={{ color: colors.textMuted, fontSize: 9, marginRight: 4 }}>{t.less || 'Less'}</Text>
        {[0.08, 0.3, 0.5, 0.75, 1].map((op, i) => (
          <View key={i} style={{ width: CELL - 2, height: CELL - 2, borderRadius: 2, backgroundColor: i === 0 ? colors.border : primaryColor, opacity: op, marginHorizontal: 1 }} />
        ))}
        <Text style={{ color: colors.textMuted, fontSize: 9, marginLeft: 4 }}>{t.more || 'More'}</Text>
      </View>
    </View>
  );
}

function StatCard({ icon, label, value, subValue, colors, primary }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: primary + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Ionicons name={icon} size={18} color={primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
      {subValue ? <Text style={{ color: primary, fontSize: 10, fontWeight: '600', marginTop: 2 }}>{subValue}</Text> : null}
    </View>
  );
}

export default function StatisticsScreen() {
  const { t, colors, stats, theme } = useApp();

  const topCards = [
    { label: t.today, value: stats.today },
    { label: t.weekly, value: stats.weekly },
    { label: t.monthly, value: stats.monthly },
    { label: t.lifetime, value: stats.lifetime },
    { label: t.mostRecited, value: stats.mostRecited },
  ];

  const bestDateFormatted = stats.bestDay
    ? `${stats.bestDay.date.slice(5)} — ${stats.bestDay.count}`
    : '—';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      {/* Summary cards */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {topCards.map((card) => (
          <View key={card.label} style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 10 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{card.label}</Text>
            <Text style={{ color: colors.text, marginTop: 8, fontSize: 18, fontWeight: '800' }}>{card.value}</Text>
          </View>
        ))}
      </View>

      {/* Streak & Best */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 14 }}>
        <StatCard icon="flame-outline" label={t.currentStreak} value={stats.currentStreak} subValue={`${t.days}`} colors={colors} primary={theme.primary} />
        <StatCard icon="trophy-outline" label={t.longestStreak} value={stats.longestStreak} subValue={`${t.days}`} colors={colors} primary={theme.primary} />
        <StatCard icon="star-outline" label={t.personalBest} value={stats.bestDay?.count || 0} subValue={stats.bestDay?.date.slice(5) || ''} colors={colors} primary={theme.primary} />
      </View>

      {/* Heatmap */}
      <Heatmap data={stats.heatmapData || []} colors={colors} primaryColor={theme.primary} t={t} />

      {/* Weekly bar chart */}
      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 14 }}>{t.weekly}</Text>
      <View style={{ marginTop: 8 }}>
        <SimpleBarChart data={stats.weeklySeries || []} colors={colors} />
      </View>

      {/* Monthly line chart */}
      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 14 }}>{t.monthly}</Text>
      <View style={{ marginTop: 8 }}>
        <SimpleLineChart data={stats.monthlySeries || []} colors={colors} />
      </View>

      {/* Per-dhikr breakdown */}
      {stats.dhikrBreakdown?.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>{t.totalRecited}</Text>
          {stats.dhikrBreakdown.map((d, i) => {
            const maxTotal = stats.dhikrBreakdown[0]?.total_count || 1;
            const pct = maxTotal > 0 ? (d.total_count / maxTotal) * 100 : 0;
            return (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{d.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{d.total_count.toLocaleString()}</Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                  <View style={{ width: `${pct}%`, height: '100%', backgroundColor: theme.primary, borderRadius: 3 }} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <AdBanner />
    </ScrollView>
  );
}
