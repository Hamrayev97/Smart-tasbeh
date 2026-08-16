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

const todayKey = () => new Date().toISOString().slice(0, 10);

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

  const [todayRow, weeklySeriesRes, monthlySeriesRes, dhikrsRes] = await Promise.all([
    run('SELECT count FROM Stats WHERE date = ?;', [today]),
    run('SELECT date, count FROM Stats WHERE date >= ? ORDER BY date;', [weekAgo.toISOString().slice(0, 10)]),
    run('SELECT date, count FROM Stats WHERE date >= ? ORDER BY date;', [monthAgo.toISOString().slice(0, 10)]),
    run('SELECT name, total_count FROM Dhikr ORDER BY total_count DESC;'),
  ]);

  const weeklySeries = weeklySeriesRes.rows._array;
  const monthlySeries = monthlySeriesRes.rows._array;
  const dhikrs = dhikrsRes.rows._array;

  return {
    today: todayRow.rows._array[0]?.count || 0,
    weekly: weeklySeries.reduce((sum, item) => sum + item.count, 0),
    monthly: monthlySeries.reduce((sum, item) => sum + item.count, 0),
    lifetime: dhikrs.reduce((sum, item) => sum + item.total_count, 0),
    mostRecited: dhikrs[0]?.name || '-',
    weeklySeries,
    monthlySeries,
  };
};

export const resetAllDailyCounts = async () => {
  await run('UPDATE Dhikr SET current_count = 0;');
};
