function generateDailyData(year, month, baseTemp, baseHumidity, baseWind, baseUv) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const data = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const temp = +(baseTemp + (Math.sin(d * 0.4) * 4 + (Math.random() - 0.5) * 3)).toFixed(1);
    const humidity = Math.round(baseHumidity + Math.sin(d * 0.3) * 8 + (Math.random() - 0.5) * 6);
    const wind = Math.round(baseWind + Math.sin(d * 0.5) * 5 + (Math.random() - 0.5) * 4);
    const uv = Math.round(Math.max(1, baseUv + Math.sin(d * 0.35) * 2 + (Math.random() - 0.5) * 1.5));
    const rain = Math.round(Math.max(0, (Math.random() * 30 - 10) + (humidity > 65 ? 10 : 0)));
    const score = Math.round(
      100 - (Math.max(0, temp - 20) * 3) - (Math.max(0, humidity - 60) * 0.8) - (Math.max(0, wind - 15) * 1.5) - (Math.max(0, uv - 6) * 4) - (rain * 0.5)
    );
    const clampedScore = Math.max(0, Math.min(100, score));
    const suitability = clampedScore >= 70 ? "suitable" : clampedScore >= 45 ? "slightly_suitable" : "not_suitable";
    data[dateStr] = { temp, humidity, wind, uv, rain, score: clampedScore, suitability };
  }
  return data;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateMonthlyData(year, baseTemp, baseHumidity, baseWind, baseUv) {
  const data = {};
  const tempCurve = [6, 5, 3, 0, -3, -6, -7, -5, -2, 1, 3, 5];
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const temp = +(baseTemp + tempCurve[m - 1]).toFixed(1);
    const humidity = Math.round(baseHumidity + (m >= 6 && m <= 8 ? -5 : 3));
    const wind = Math.round(baseWind + (Math.random() - 0.5) * 4);
    const uv = Math.round(Math.max(1, baseUv + tempCurve[m - 1] * 0.5));
    const score = Math.round(
      100 - (Math.max(0, temp - 20) * 3) - (Math.max(0, humidity - 60) * 0.8) - (Math.max(0, wind - 15) * 1.5) - (Math.max(0, uv - 6) * 4)
    );
    const clampedScore = Math.max(0, Math.min(100, score));
    const suitability = clampedScore >= 70 ? "suitable" : clampedScore >= 45 ? "slightly_suitable" : "not_suitable";
    data[key] = { temp, humidity, wind, uv, score: clampedScore, suitability, label: monthNames[m - 1] };
  }
  return data;
}

function generateQuarterlyData(monthlyData) {
  const quarters = { Q1: ["01", "02", "03"], Q2: ["04", "05", "06"], Q3: ["07", "08", "09"], Q4: ["10", "11", "12"] };
  const data = {};
  for (const [q, months] of Object.entries(quarters)) {
    const entries = months.map((m) => monthlyData[`2025-${m}`]).filter(Boolean);
    if (!entries.length) continue;
    const avg = (arr, key) => +(arr.reduce((s, e) => s + e[key], 0) / arr.length).toFixed(1);
    const score = Math.round(avg(entries, "score"));
    const suitability = score >= 70 ? "suitable" : score >= 45 ? "slightly_suitable" : "not_suitable";
    data[q] = { temp: avg(entries, "temp"), humidity: Math.round(avg(entries, "humidity")), wind: Math.round(avg(entries, "wind")), uv: Math.round(avg(entries, "uv")), score, suitability };
  }
  return data;
}

function generateAnnualData(monthlyData2024, monthlyData2025) {
  const avgYear = (md) => {
    const entries = Object.values(md);
    const avg = (key) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1);
    const score = Math.round(avg("score"));
    return { temp: avg("temp"), humidity: Math.round(avg("humidity")), wind: Math.round(avg("wind")), uv: Math.round(avg("uv")), score, suitability: score >= 70 ? "suitable" : score >= 45 ? "slightly_suitable" : "not_suitable" };
  };
  return { "2024": avgYear(monthlyData2024), "2025": avgYear(monthlyData2025) };
}

function buildLocation(id, name, state, lat, lng, suburbs, mapX, mapY, baseTemp, baseHumidity, baseWind, baseUv, confidence) {
  const monthly2025 = generateMonthlyData(2025, baseTemp, baseHumidity, baseWind, baseUv);
  const monthly2024 = generateMonthlyData(2024, baseTemp + 0.3, baseHumidity - 1, baseWind + 0.5, baseUv);
  const daily = {};
  for (let m = 1; m <= 12; m++) {
    Object.assign(daily, generateDailyData(2025, m, monthly2025[`2025-${String(m).padStart(2, "0")}`].temp, monthly2025[`2025-${String(m).padStart(2, "0")}`].humidity, monthly2025[`2025-${String(m).padStart(2, "0")}`].wind, monthly2025[`2025-${String(m).padStart(2, "0")}`].uv));
  }
  return {
    id, name, state, lat, lng, suburbs, mapX, mapY, confidence,
    daily,
    monthly: { ...generateMonthlyData(2024, baseTemp + 0.3, baseHumidity - 1, baseWind + 0.5, baseUv), ...monthly2025 },
    quarterly: generateQuarterlyData(monthly2025),
    annual: generateAnnualData(monthly2024, monthly2025),
  };
}

export const locations = [
  buildLocation("melbourne", "Melbourne CBD", "VIC", -37.81, 144.96, ["Melbourne CBD", "Albert Park", "St Kilda", "Docklands", "Southbank"], 76, 82, 20, 60, 14, 5, "High"),
  buildLocation("sydney", "Sydney Olympic Park", "NSW", -33.85, 151.06, ["Sydney Olympic Park", "Parramatta", "Bondi", "Homebush", "Centennial Park"], 86, 68, 22, 68, 13, 6, "Medium"),
  buildLocation("brisbane", "South Bank, Brisbane", "QLD", -27.47, 153.02, ["South Bank", "Brisbane CBD", "Kangaroo Point", "New Farm", "West End"], 87, 46, 25, 72, 12, 8, "Medium"),
  buildLocation("perth", "Perth Riverside", "WA", -31.95, 115.86, ["Perth Riverside", "Kings Park", "Subiaco", "East Perth", "South Perth"], 14, 64, 19, 56, 15, 6, "High"),
  buildLocation("adelaide", "Adelaide Parklands", "SA", -34.93, 138.60, ["Adelaide Parklands", "North Adelaide", "Glenelg", "Norwood", "Unley"], 56, 76, 22, 52, 14, 6, "High"),
  buildLocation("hobart", "Hobart Waterfront", "TAS", -42.88, 147.33, ["Hobart Waterfront", "Battery Point", "Sandy Bay", "North Hobart", "Kingston"], 78, 92, 16, 62, 16, 4, "Medium"),
  buildLocation("darwin", "Darwin Esplanade", "NT", -12.46, 130.84, ["Darwin Esplanade", "Fannie Bay", "Stuart Park", "Parap", "Nightcliff"], 48, 14, 31, 78, 10, 10, "Low"),
  buildLocation("canberra", "Lake Burley Griffin", "ACT", -35.28, 149.13, ["Lake Burley Griffin", "Civic", "Kingston", "Manuka", "Woden"], 82, 74, 20, 55, 12, 6, "High"),
];

export const suitabilityConfig = {
  suitable:          { label: "Suitable",          color: "bg-[#2d6a4f]", textColor: "text-[#22523c]", chipBg: "bg-[#dbeadf]", chipBorder: "border-[#8eb59d]", hex: "#2d6a4f" },
  slightly_suitable: { label: "Slightly Suitable", color: "bg-[#e9c46a]", textColor: "text-[#8a6617]", chipBg: "bg-[#fbefcc]", chipBorder: "border-[#e3c46f]", hex: "#e9c46a" },
  not_suitable:      { label: "Not Suitable",      color: "bg-[#e76f51]", textColor: "text-[#9b422d]", chipBg: "bg-[#f8ddd5]", chipBorder: "border-[#e7a18d]", hex: "#e76f51" },
};

export const weatherAttributes = [
  { key: "temp", label: "Temperature", unit: "\u00b0C", color: "#ef4444", icon: "Thermometer" },
  { key: "humidity", label: "Humidity", unit: "%", color: "#3b82f6", icon: "Droplets" },
  { key: "wind", label: "Wind Speed", unit: "km/h", color: "#8b5cf6", icon: "Wind" },
  { key: "uv", label: "UV Index", unit: "", color: "#f59e0b", icon: "Sun" },
];

export const timeGranularities = [
  { key: "daily", label: "Daily" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "annually", label: "Annually" },
];

export const eventTypes = ["Marathon", "Half Marathon", "10K"];

export function getDataForGranularity(location, granularity, selectedYear = 2025, selectedMonth = 9) {
  if (granularity === "daily") {
    const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    return Object.entries(location.daily)
      .filter(([k]) => k.startsWith(prefix))
      .map(([date, d]) => ({ date, day: parseInt(date.split("-")[2]), ...d }))
      .sort((a, b) => a.day - b.day);
  }
  if (granularity === "monthly") {
    return Object.entries(location.monthly)
      .filter(([k]) => k.startsWith(String(selectedYear)))
      .map(([key, d]) => ({ key, month: parseInt(key.split("-")[1]), ...d }))
      .sort((a, b) => a.month - b.month);
  }
  if (granularity === "quarterly") {
    return Object.entries(location.quarterly).map(([key, d]) => ({ key, ...d })).sort((a, b) => a.key.localeCompare(b.key));
  }
  if (granularity === "annually") {
    return Object.entries(location.annual).map(([key, d]) => ({ key, year: parseInt(key), ...d })).sort((a, b) => a.year - b.year);
  }
  return [];
}

