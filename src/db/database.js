import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultDhikrs } from '../theme/themes';

const DHIKR_TABLE = 'db_Dhikr';
const STATS_TABLE = 'db_Stats';

const read = async (key, fallback = []) => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
};

const write = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));

export const initDatabase = async () => {
  const dhikrs = await read(DHIKR_TABLE, []);
  if (!dhikrs.length) {
    const now = new Date().toISOString();
    const seeded = defaultDhikrs.map((item, index) => ({
      id: index + 1,
      name: item.name,
      current_count: 0,
      total_count: 0,
      target: item.target,
      color_theme: item.colorTheme,
      created_date: now,
    }));
    await write(DHIKR_TABLE, seeded);
  }
  const stats = await read(STATS_TABLE, null);
  if (!stats) await write(STATS_TABLE, []);
};

export const getDhikrs = async () => read(DHIKR_TABLE, []);

export const addDhikr = async ({ name, target, colorTheme }) => {
  const dhikrs = await read(DHIKR_TABLE, []);
  const id = (Math.max(0, ...dhikrs.map((d) => d.id)) || 0) + 1;
  dhikrs.push({ id, name, current_count: 0, total_count: 0, target, color_theme: colorTheme, created_date: new Date().toISOString() });
  await write(DHIKR_TABLE, dhikrs);
};

export const updateDhikr = async ({ id, name, target, colorTheme }) => {
  const dhikrs = await read(DHIKR_TABLE, []);
  const next = dhikrs.map((item) => (item.id === id ? { ...item, name, target, color_theme: colorTheme } : item));
  await write(DHIKR_TABLE, next);
};

export const deleteDhikr = async (id) => {
  const dhikrs = await read(DHIKR_TABLE, []);
  await write(DHIKR_TABLE, dhikrs.filter((item) => item.id !== id));
};

export const incrementDhikrCount = async (id) => {
  const dhikrs = await read(DHIKR_TABLE, []);
  const stats = await read(STATS_TABLE, []);
  const today = new Date().toISOString().slice(0, 10);

  const nextDhikrs = dhikrs.map((item) =>
    item.id === id
      ? { ...item, current_count: item.current_count + 1, total_count: item.total_count + 1 }
      : item
  );

  const statIndex = stats.findIndex((item) => item.date === today);
  if (statIndex === -1) stats.push({ date: today, count: 1 });
  else stats[statIndex].count += 1;

  await write(DHIKR_TABLE, nextDhikrs);
  await write(STATS_TABLE, stats);
};

export const resetCurrentDhikrCount = async (id) => {
  const dhikrs = await read(DHIKR_TABLE, []);
  await write(DHIKR_TABLE, dhikrs.map((item) => (item.id === id ? { ...item, current_count: 0 } : item)));
};

export const getAggregatedStats = async () => {
  const dhikrs = await read(DHIKR_TABLE, []);
  const stats = await read(STATS_TABLE, []);
  const today = new Date().toISOString().slice(0, 10);

  const filterFrom = (days) => {
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    return stats.filter((item) => new Date(item.date) >= from);
  };

  const weeklySeries = filterFrom(7);
  const monthlySeries = filterFrom(30);

  return {
    today: stats.find((item) => item.date === today)?.count || 0,
    weekly: weeklySeries.reduce((sum, item) => sum + item.count, 0),
    monthly: monthlySeries.reduce((sum, item) => sum + item.count, 0),
    lifetime: dhikrs.reduce((sum, item) => sum + item.total_count, 0),
    mostRecited: dhikrs.sort((a, b) => b.total_count - a.total_count)[0]?.name || '-',
    weeklySeries,
    monthlySeries,
  };
};

export const resetAllDailyCounts = async () => {
  const dhikrs = await read(DHIKR_TABLE, []);
  await write(DHIKR_TABLE, dhikrs.map((item) => ({ ...item, current_count: 0 })));
};
