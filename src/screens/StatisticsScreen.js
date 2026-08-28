import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import Svg, { Rect, Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useApp } from '../hooks/useAppContext';
import AdBanner from '../components/AdBanner';

const CHART_W = Dimensions.get('window').width - 32;
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

export default function StatisticsScreen() {
  const { t, colors, stats } = useApp();
  const cards = [
    { label: t.today, value: stats.today },
    { label: t.weekly, value: stats.weekly },
    { label: t.monthly, value: stats.monthly },
    { label: t.lifetime, value: stats.lifetime },
    { label: t.mostRecited, value: stats.mostRecited },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {cards.map((card) => (
          <View key={card.label} style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 10 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{card.label}</Text>
            <Text style={{ color: colors.text, marginTop: 8, fontSize: 18, fontWeight: '800' }}>{card.value}</Text>
          </View>
        ))}
      </View>

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 10 }}>{t.weekly}</Text>
      <View style={{ marginTop: 8 }}>
        <SimpleBarChart data={stats.weeklySeries || []} colors={colors} />
      </View>

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 14 }}>{t.monthly}</Text>
      <View style={{ marginTop: 8 }}>
        <SimpleLineChart data={stats.monthlySeries || []} colors={colors} />
      </View>

      <AdBanner />
    </ScrollView>
  );
}
