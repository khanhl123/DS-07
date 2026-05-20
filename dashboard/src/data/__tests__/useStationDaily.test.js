import { describe, it, expect } from "vitest";
import {
  aggregateMarathonVerdict,
  averageYearSeries,
  summariseMonthly,
} from "../useStationDaily";

describe("summariseMonthly", () => {
  it("returns the zero-shape when no daily rows", () => {
    expect(summariseMonthly([])).toMatchObject({ maxTemp: 0, dryDaysPct: 0 });
    expect(summariseMonthly(undefined)).toMatchObject({ maxTemp: 0 });
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

describe("aggregateMarathonVerdict", () => {
  it("returns null when no days carry a verdict", () => {
    expect(aggregateMarathonVerdict([])).toBeNull();
    expect(aggregateMarathonVerdict([{ day: 1 }, { day: 2 }])).toBeNull();
    expect(
      aggregateMarathonVerdict([{ day: 1, marathonVerdict: null }]),
    ).toBeNull();
  });

  it("averages scores from days that have a verdict, ignoring the rest", () => {
    const daily = [
      { day: 1, marathonVerdict: { score: 80, colour: "GREEN" } },
      { day: 2, marathonVerdict: { score: 60, colour: "ORANGE" } },
      { day: 3, marathonVerdict: null },
      { day: 4 },
    ];
    const v = aggregateMarathonVerdict(daily);
    expect(v.score).toBe(70);
    // 70 sits on the ORANGE side of the boundary (avg <= 70 -> ORANGE)
    expect(v.colour).toBe("ORANGE");
  });

  it("maps average above 70 to GREEN and at-or-below 40 to RED", () => {
    const green = aggregateMarathonVerdict([
      { day: 1, marathonVerdict: { score: 85, colour: "GREEN" } },
      { day: 2, marathonVerdict: { score: 75, colour: "GREEN" } },
    ]);
    expect(green.colour).toBe("GREEN");

    const red = aggregateMarathonVerdict([
      { day: 1, marathonVerdict: { score: 20, colour: "RED" } },
      { day: 2, marathonVerdict: { score: 40, colour: "ORANGE" } },
    ]);
    expect(red.colour).toBe("RED");
  });
});

describe("summariseMonthly with marathonVerdict", () => {
  it("includes a null verdict when daily rows carry none", () => {
    const s = summariseMonthly([
      { day: 1, maxTemp: 25, minTemp: 12, rainfall: 0, uvIndex: 7 },
    ]);
    expect(s.marathonVerdict).toBeNull();
  });

  it("returns marathonVerdict null for the empty-month shape", () => {
    expect(summariseMonthly([]).marathonVerdict).toBeNull();
  });

  it("aggregates per-day verdicts into a single bucket and score", () => {
    const daily = [
      { day: 1, marathonVerdict: { score: 90, colour: "GREEN" } },
      { day: 2, marathonVerdict: { score: 80, colour: "GREEN" } },
    ];
    const s = summariseMonthly(daily);
    expect(s.marathonVerdict).toEqual({ score: 85, colour: "GREEN" });
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
