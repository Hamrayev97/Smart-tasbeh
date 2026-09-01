import * as SQLite from 'expo-sqlite';
import { defaultDhikrs } from '../theme/themes';

const db = SQLite.openDatabase('smarttasbeh.db');

const run = (sql, args = []) =>
  new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          args,
          (_, resultSet) => resolve(resultSet),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const initDatabase = async () => {
  await run(
    `CREATE TABLE IF NOT EXISTS Dhikr (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current_count INTEGER NOT NULL DEFAULT 0,
      total_count INTEGER NOT NULL DEFAULT 0,
      target INTEGER NOT NULL DEFAULT 33,
      color_theme TEXT,
      created_date TEXT
    );`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS Stats (
      date TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS FastingDays (
      date TEXT PRIMARY KEY,
      fasted INTEGER NOT NULL DEFAULT 0
    );`
  );

  const { rows } = await run('SELECT COUNT(*) as count FROM Dhikr;');
  if (rows._array[0].count === 0) {
    const now = new Date().toISOString();
    for (const item of defaultDhikrs) {
      await run(
        'INSERT INTO Dhikr (name, current_count, total_count, target, color_theme, created_date) VALUES (?, 0, 0, ?, ?, ?);',
        [item.name, item.target, item.colorTheme, now]
      );
    }
  }
};

export const getDhikrs = async () => {
  const { rows } = await run('SELECT * FROM Dhikr ORDER BY id;');
  return rows._array;
};

export const addDhikr = async ({ name, target, colorTheme }) => {
  await run(
    'INSERT INTO Dhikr (name, current_count, total_count, target, color_theme, created_date) VALUES (?, 0, 0, ?, ?, ?);',
    [name, target, colorTheme, new Date().toISOString()]
  );
};

export const updateDhikr = async ({ id, name, target, colorTheme }) => {
  await run('UPDATE Dhikr SET name = ?, target = ?, color_theme = ? WHERE id = ?;', [name, target, colorTheme, id]);
};

export const deleteDhikr = async (id) => {
  await run('DELETE FROM Dhikr WHERE id = ?;', [id]);
};

export const incrementDhikrCount = async (id) => {
  await run('UPDATE Dhikr SET current_count = current_count + 1, total_count = total_count + 1 WHERE id = ?;', [id]);

  const today = todayKey();
  const { rows } = await run('SELECT count FROM Stats WHERE date = ?;', [today]);
  if (rows.length === 0) {
    await run('INSERT INTO Stats (date, count) VALUES (?, 1);', [today]);
  } else {
    await run('UPDATE Stats SET count = count + 1 WHERE date = ?;', [today]);
  }
};

export const resetCurrentDhikrCount = async (id) => {
  await run('UPDATE Dhikr SET current_count = 0 WHERE id = ?;', [id]);
};

export const getAggregatedStats = async () => {
  const today = todayKey();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 29);

  const localDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const heatmapStart = new Date();
  heatmapStart.setDate(heatmapStart.getDate() - 90);

  const [todayRow, weeklySeriesRes, monthlySeriesRes, dhikrsRes, heatmapRes, bestDayRes] = await Promise.all([
    run('SELECT count FROM Stats WHERE date = ?;', [today]),
    run('SELECT date, count FROM Stats WHERE date >= ? ORDER BY date;', [localDate(weekAgo)]),
    run('SELECT date, count FROM Stats WHERE date >= ? ORDER BY date;', [localDate(monthAgo)]),
    run('SELECT name, total_count FROM Dhikr ORDER BY total_count DESC;'),
    run('SELECT date, count FROM Stats WHERE date >= ? ORDER BY date;', [localDate(heatmapStart)]),
    run('SELECT date, count FROM Stats ORDER BY count DESC LIMIT 1;'),
  ]);

  const weeklySeries = weeklySeriesRes.rows._array;
  const monthlySeries = monthlySeriesRes.rows._array;
  const dhikrs = dhikrsRes.rows._array;
  const heatmapData = heatmapRes.rows._array;
  const bestDay = bestDayRes.rows._array[0] || null;

  const countByDate = {};
  heatmapData.forEach((d) => { countByDate[d.date] = d.count; });

  let currentStreak = 0;
  const cursor = new Date();
  const todayCount = todayRow.rows._array[0]?.count || 0;
  if (todayCount === 0) cursor.setDate(cursor.getDate() - 1);
  while (countByDate[localDate(cursor)] > 0) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longestStreak = 0;
  let run_ = 0;
  const walker = new Date(heatmapStart);
  for (let i = 0; i <= 91; i++) {
    if (countByDate[localDate(walker)] > 0) {
      run_++;
      if (run_ > longestStreak) longestStreak = run_;
    } else {
      run_ = 0;
    }
    walker.setDate(walker.getDate() + 1);
  }

  return {
    today: todayCount,
    weekly: weeklySeries.reduce((sum, item) => sum + item.count, 0),
    monthly: monthlySeries.reduce((sum, item) => sum + item.count, 0),
    lifetime: dhikrs.reduce((sum, item) => sum + item.total_count, 0),
    mostRecited: dhikrs[0]?.name || '-',
    weeklySeries,
    monthlySeries,
    heatmapData,
    bestDay,
    currentStreak,
    longestStreak,
    dhikrBreakdown: dhikrs,
  };
};

export const resetAllDailyCounts = async () => {
  await run('UPDATE Dhikr SET current_count = 0;');
};

export const setFastingDay = async (date, fasted) => {
  const value = fasted ? 1 : 0;
  const { rows } = await run('SELECT date FROM FastingDays WHERE date = ?;', [date]);
  if (rows.length === 0) {
    await run('INSERT INTO FastingDays (date, fasted) VALUES (?, ?);', [date, value]);
  } else {
    await run('UPDATE FastingDays SET fasted = ? WHERE date = ?;', [value, date]);
  }
};

export const getFastingDay = async (date) => {
  const { rows } = await run('SELECT fasted FROM FastingDays WHERE date = ?;', [date]);
  return rows._array[0]?.fasted === 1;
};

export const getFastingDaysCount = async () => {
  const { rows } = await run('SELECT COUNT(*) as count FROM FastingDays WHERE fasted = 1;');
  return rows._array[0]?.count || 0;
};

export const getAllFastingDates = async () => {
  const { rows } = await run('SELECT date FROM FastingDays WHERE fasted = 1;');
  return rows._array.map((row) => row.date);
};

export const exportAllData = async () => {
  const [dhikrs, stats, fasting] = await Promise.all([
    run('SELECT * FROM Dhikr ORDER BY id;'),
    run('SELECT * FROM Stats ORDER BY date;'),
    run('SELECT * FROM FastingDays ORDER BY date;'),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'SmartTasbeh',
    dhikrs: dhikrs.rows._array,
    stats: stats.rows._array,
    fastingDays: fasting.rows._array,
  };
};

export const importAllData = async (data) => {
  if (data.app !== 'SmartTasbeh' || !data.dhikrs) {
    throw new Error('Invalid backup file');
  }

  await run('DELETE FROM Dhikr;');
  await run('DELETE FROM Stats;');
  await run('DELETE FROM FastingDays;');

  for (const d of data.dhikrs) {
    await run(
      'INSERT INTO Dhikr (name, current_count, total_count, target, color_theme, created_date) VALUES (?, ?, ?, ?, ?, ?);',
      [d.name, d.current_count || 0, d.total_count || 0, d.target || 33, d.color_theme || null, d.created_date || new Date().toISOString()]
    );
  }

  for (const s of (data.stats || [])) {
    await run('INSERT OR REPLACE INTO Stats (date, count) VALUES (?, ?);', [s.date, s.count]);
  }

  for (const f of (data.fastingDays || [])) {
    await run('INSERT OR REPLACE INTO FastingDays (date, fasted) VALUES (?, ?);', [f.date, f.fasted]);
  }
};
