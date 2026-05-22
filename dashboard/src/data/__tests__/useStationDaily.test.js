import { describe, it, expect } from "vitest";
import {
  averageYearSeries,
  buildDailyUrl,
  buildPredictedUrl,
  summariseMonthly,
} from "../useStationDaily";

describe("buildDailyUrl", () => {
  it("returns null without a station", () => {
    expect(buildDailyUrl(null, 0, 2025)).toBeNull();
  });

  it("strips leading zeros from station number", () => {
    // "066062" → 66062 (Number.parseInt) so the backend ID matches the DB.
    const url = buildDailyUrl({ n: "066062" }, 5, 2024);
    expect(url).toBe("/api/stations/66062/daily?year=2024&month=6");
  });
});

describe("buildPredictedUrl", () => {
  it("returns null without a station", () => {
    expect(buildPredictedUrl(null, 0, 2027)).toBeNull();
  });

  it("includes lat/lng so the backend can call NN models without a stations table", () => {
    const url = buildPredictedUrl(
      { n: "066062", lat: -33.87, lng: 151.21 },
      5, // monthIndex 5 → June
      2027,
    );
    expect(url).toBe(
      "/api/stations/66062/predicted?year=2027&month=6&lat=-33.87&lng=151.21",
    );
  });
});

describe("summariseMonthly", () => {
  it("returns the null-shape when no daily rows", () => {
    // Empty/undefined input maps to null fields (not zero) so KPI cards render
    // "—" rather than a misleading "0°C / 0 mm". See useStationDaily.js:142.
    expect(summariseMonthly([])).toMatchObject({ maxTemp: null, dryDaysPct: null });
    expect(summariseMonthly(undefined)).toMatchObject({ maxTemp: null });
  });

  it("excludes null readings from each metric's average independently", () => {
    // 3 days of max_temp data; 2 days missing. Average should be 30, not 18.
    const daily = [
      { day: 1, maxTemp: 30, minTemp: null, rainfall: 0, uvIndex: 9 },
      { day: 2, maxTemp: 30, minTemp: null, rainfall: 0, uvIndex: 9 },
      { day: 3, maxTemp: 30, minTemp: 15, rainfall: 0, uvIndex: 9 },
      { day: 4, maxTemp: null, minTemp: 15, rainfall: 0, uvIndex: 9 },
      { day: 5, maxTemp: null, minTemp: 15, rainfall: 0, uvIndex: 9 },
    ];
    const s = summariseMonthly(daily);
    expect(s.maxTemp).toBe(30);
    expect(s.minTemp).toBe(15);
  });

  it("dryDaysPct uses the count of days with rainfall data, not total days", () => {
    // 2 dry days, 2 wet days, 1 null. Should be 50% dry, not 40%.
    const daily = [
      { day: 1, rainfall: 0 },
      { day: 2, rainfall: 0.5 },
      { day: 3, rainfall: 5 },
      { day: 4, rainfall: 5 },
      { day: 5, rainfall: null },
    ];
    expect(summariseMonthly(daily).dryDaysPct).toBe(50);
  });
});

describe("averageYearSeries", () => {
  it("returns nulls when the series is empty", () => {
    const s = averageYearSeries([]);
    expect(s.maxTemp).toBeNull();
    expect(s.dryDaysPct).toBeNull();
  });

  it("returns null for a field that's missing in every month", () => {
    const series = [
      { maxTemp: 25, maxTempMin: 20, maxTempMax: 30, minTemp: null,
        minTempMin: null, minTempMax: null,
        rainfall: 5, dryDaysPct: 50, uvIndex: 8, uvHighPct: 30 },
      { maxTemp: 27, maxTempMin: 22, maxTempMax: 32, minTemp: null,
        minTempMin: null, minTempMax: null,
        rainfall: 7, dryDaysPct: 40, uvIndex: 9, uvHighPct: 35 },
    ];
    const s = averageYearSeries(series);
    expect(s.minTemp).toBeNull();
    expect(s.minTempMin).toBeNull();
    expect(s.maxTemp).toBe(26);
  });

  it("averages only over months with non-null values per field", () => {
    // maxTemp present in 2 of 3 months → average should be (20+30)/2 = 25.
    const series = [
      { maxTemp: 20, maxTempMin: 15, maxTempMax: 25 },
      { maxTemp: 30, maxTempMin: 25, maxTempMax: 35 },
      { maxTemp: null, maxTempMin: null, maxTempMax: null },
    ];
    expect(averageYearSeries(series).maxTemp).toBe(25);
  });
});
