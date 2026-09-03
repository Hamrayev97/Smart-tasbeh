const UZ_REGIONS = [
  { name: 'Toshkent', lat: 41.2995, lon: 69.2401 },
  { name: 'Samarqand', lat: 39.6542, lon: 66.9597 },
  { name: 'Buxoro', lat: 39.7745, lon: 64.4286 },
  { name: 'Andijon', lat: 40.7821, lon: 72.3442 },
  { name: "Farg'ona", lat: 40.3834, lon: 71.7870 },
  { name: 'Namangan', lat: 40.9983, lon: 71.6726 },
  { name: 'Qarshi', lat: 38.8606, lon: 65.7986 },
  { name: 'Termiz', lat: 37.2241, lon: 67.2783 },
  { name: 'Jizzax', lat: 40.1158, lon: 67.8422 },
  { name: 'Guliston', lat: 40.4897, lon: 68.7842 },
  { name: 'Navoiy', lat: 40.0844, lon: 65.3792 },
  { name: 'Urganch', lat: 41.5500, lon: 60.6333 },
  { name: 'Nukus', lat: 42.4628, lon: 59.6031 },
  { name: "Qo'qon", lat: 40.5286, lon: 70.9425 },
  { name: 'Shahrisabz', lat: 39.0578, lon: 66.8308 },
  { name: 'Denov', lat: 38.2714, lon: 67.8936 },
  { name: 'Chirchiq', lat: 41.4689, lon: 69.5822 },
  { name: 'Olmaliq', lat: 40.8444, lon: 69.5992 },
  { name: "Marg'ilon", lat: 40.4700, lon: 71.7200 },
  { name: 'Xiva', lat: 41.3786, lon: 60.3639 },
  { name: "Bog'ot", lat: 41.6389, lon: 60.0500 },
  { name: 'Turtkul', lat: 41.5500, lon: 60.9167 },
  { name: 'Taxiatosh', lat: 42.2500, lon: 59.5167 },
  { name: "Mo'ynoq", lat: 43.7667, lon: 58.6833 },
];

const toRad = (deg) => (deg * Math.PI) / 180;

function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestUzRegion(lat, lon) {
  let best = null;
  let bestDist = Infinity;
  for (const r of UZ_REGIONS) {
    const d = haversineKm(lat, lon, r.lat, r.lon);
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }
  return bestDist < 300 ? best.name : null;
}

function stripSeconds(time) {
  if (!time) return '';
  const parts = time.split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
}

async function fetchFromIslomApi(region) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const url = `https://islomapi.uz/api/daily?region=${encodeURIComponent(region)}&month=${month}&day=${day}`;
  const response = await fetch(url);
  const json = await response.json();
  const data = json.data || json.response || json;
  if (!data.bomdod) throw new Error('No prayer times in islomapi response');
  return {
    Fajr: stripSeconds(data.bomdod),
    Sunrise: stripSeconds(data.quyosh),
    Dhuhr: stripSeconds(data.peshin),
    Asr: stripSeconds(data.asr),
    Maghrib: stripSeconds(data.shom),
    Isha: stripSeconds(data.xufton),
  };
}

async function fetchHijriDate(coords) {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=3&school=1`
  );
  const json = await response.json();
  return json?.data?.date?.hijri || null;
}

async function fetchFromAladhan(coords) {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=3&school=1`
  );
  const json = await response.json();
  if (!json?.data?.timings) throw new Error('No timings in response');
  return { timings: json.data.timings, hijri: json.data.date?.hijri || null };
}

export async function fetchTodayTimings(coords) {
  const region = nearestUzRegion(coords.latitude, coords.longitude);

  if (region) {
    try {
      const [uzTimings, hijri] = await Promise.all([
        fetchFromIslomApi(region),
        fetchHijriDate(coords).catch(() => null),
      ]);
      return { timings: uzTimings, hijri };
    } catch (_) {
      // islomapi.uz failed — fall back to Aladhan
    }
  }

  return fetchFromAladhan(coords);
}
