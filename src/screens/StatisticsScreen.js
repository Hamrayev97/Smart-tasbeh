import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useApp } from '../hooks/useAppContext';

const width = Dimensions.get('window').width - 32;

const chartCfg = (colors) => ({
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(15, 157, 121, ${opacity})`,
  labelColor: () => colors.textMuted,
  barPercentage: 0.6,
});

const buildData = (series, fallbackLength = 7) => {
  if (!series?.length) {
    return { labels: Array.from({ length: fallbackLength }, (_, i) => `${i + 1}`), datasets: [{ data: Array(fallbackLength).fill(0) }] };
  }
  return {
    labels: series.map((d) => d.date.slice(5)),
    datasets: [{ data: series.map((d) => d.count) }],
  };
};

export default function StatisticsScreen() {
  const { t, colors, stats, premium } = useApp();
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

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 10 }}>Weekly</Text>
      <BarChart style={{ borderRadius: 12, marginTop: 8 }} width={width} height={200} fromZero data={buildData(stats.weeklySeries, 7)} chartConfig={chartCfg(colors)} />

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 14 }}>Monthly</Text>
      <LineChart style={{ borderRadius: 12, marginTop: 8 }} width={width} height={220} fromZero data={buildData(stats.monthlySeries, 8)} chartConfig={chartCfg(colors)} bezier />

      {!premium && (
        <View style={{ marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
          <Text style={{ color: colors.textMuted }}>{t.bannerAd} • {t.free} ({t.premium}: {t.noAds})</Text>
        </View>
      )}
    </ScrollView>
  );
}
