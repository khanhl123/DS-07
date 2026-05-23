import { describe, it, expect } from "vitest";
import {
  DEFAULT_THRESHOLDS,
  BUFFERS,
  computeDailyScore,
  computeMonthlyScore,
  computeProbability,
} from "../suitabilityScore";

const day = (overrides = {}) => ({
  maxTemp: 22,
  minTemp: 12,
  rainfall: 0,
  uvIndex: 5,
  ...overrides,
});

describe("computeDailyScore", () => {
  it("a day fully within every threshold scores a perfect 100", () => {
    expect(computeDailyScore(day(), DEFAULT_THRESHOLDS)).toBe(100);
  });

  it("returns null when any of the four weather fields is missing", () => {
    expect(computeDailyScore(day({ maxTemp: null }), DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeDailyScore(day({ minTemp: NaN }), DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeDailyScore(day({ rainfall: undefined }), DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeDailyScore(day({ uvIndex: null }), DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeDailyScore(null, DEFAULT_THRESHOLDS)).toBeNull();
  });

  it("maxTemp penalises when actual EXCEEDS threshold (linear in distance / buffer)", () => {
    // threshold 28, buffer 10. Actual 33 → distance 5 → sub-score = 25 * (1 - 5/10) = 12.5.
    // Other three metrics still perfect (25 each) → 25*3 + 12.5 = 87.5.
    const s = computeDailyScore(day({ maxTemp: 33 }), DEFAULT_THRESHOLDS);
    expect(s).toBeCloseTo(87.5, 6);
  });

  it("maxTemp sub-score floors at zero once the actual is a full buffer past the threshold", () => {
    // 28 + 10 = 38 → distance == buffer → sub-score 0. Anything beyond stays 0.
    const at = computeDailyScore(day({ maxTemp: 38 }), DEFAULT_THRESHOLDS);
    const past = computeDailyScore(day({ maxTemp: 60 }), DEFAULT_THRESHOLDS);
    expect(at).toBeCloseTo(75, 6);
    expect(past).toBeCloseTo(75, 6);
  });

  it("minTemp penalises when actual is BELOW threshold (opposite direction)", () => {
    // threshold 0, buffer 8. Actual -4 → distance 4 → sub-score = 25 * (1 - 4/8) = 12.5.
    const s = computeDailyScore(day({ minTemp: -4 }), DEFAULT_THRESHOLDS);
    expect(s).toBeCloseTo(87.5, 6);
  });

  it("rainfall and uvIndex both penalise when actual EXCEEDS threshold", () => {
    // rainfall threshold 5, buffer 15. Actual 12.5 → distance 7.5 → 25 * (1 - 0.5) = 12.5.
    // uv threshold 7, buffer 6. Actual 10 → distance 3 → 25 * (1 - 0.5) = 12.5.
    const rainOnly = computeDailyScore(day({ rainfall: 12.5 }), DEFAULT_THRESHOLDS);
    const uvOnly = computeDailyScore(day({ uvIndex: 10 }), DEFAULT_THRESHOLDS);
    expect(rainOnly).toBeCloseTo(87.5, 6);
    expect(uvOnly).toBeCloseTo(87.5, 6);
  });

  it("respects custom thresholds (e.g. tightening maxTemp from 28 to 20 starts to penalise a 22°C day)", () => {
    // default — 22 is within 28: perfect day → 100.
    expect(computeDailyScore(day(), DEFAULT_THRESHOLDS)).toBe(100);
    // tighter — 22 is 2 over 20, buffer 10 → 25 * (1 - 0.2) = 20.
    const tight = computeDailyScore(day(), { ...DEFAULT_THRESHOLDS, maxTemp: 20 });
    expect(tight).toBeCloseTo(95, 6);
  });

  it("buffers are exposed as constants and are not user-adjustable", () => {
    expect(BUFFERS.maxTemp).toBe(10);
    expect(BUFFERS.minTemp).toBe(8);
    expect(BUFFERS.rainfall).toBe(15);
    expect(BUFFERS.uvIndex).toBe(6);
  });
});

describe("computeMonthlyScore", () => {
  it("returns null on empty / undefined input", () => {
    expect(computeMonthlyScore([], DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeMonthlyScore(undefined, DEFAULT_THRESHOLDS)).toBeNull();
  });

  it("is the rounded mean of per-day scores over rows with all four metrics finite", () => {
    // Two perfect days (100 each) and one half-penalised day on maxTemp (87.5).
    // Rows with missing fields are dropped from the mean.
    const rows = [
      day(),
      day(),
      day({ maxTemp: 33 }),
      day({ rainfall: null }),
    ];
    // Mean of (100, 100, 87.5) = 95.833... → 96
    expect(computeMonthlyScore(rows, DEFAULT_THRESHOLDS)).toBe(96);
  });

  it("tightening any threshold lowers the monthly score (or leaves it equal)", () => {
    const rows = [day({ maxTemp: 24 }), day({ maxTemp: 26 }), day({ maxTemp: 28 })];
    const loose = computeMonthlyScore(rows, DEFAULT_THRESHOLDS);
    const tight = computeMonthlyScore(rows, { ...DEFAULT_THRESHOLDS, maxTemp: 22 });
    expect(tight).toBeLessThan(loose);
  });
});

describe("computeProbability", () => {
  it("returns the percentage of usable days where ALL four metrics meet their thresholds", () => {
    const rows = [
      day(),                       // passes
      day({ maxTemp: 29 }),        // > maxTemp threshold 28 — fails
      day({ minTemp: -1 }),        // < minTemp threshold 0 — fails
      day({ rainfall: 6 }),        // > rainfall threshold 5 — fails
      day(),                       // passes
    ];
    // 2 of 5 pass → 40%.
    expect(computeProbability(rows, DEFAULT_THRESHOLDS)).toBe(40);
  });

  it("counts only rows with all four weather fields finite in the denominator", () => {
    const rows = [day(), day({ maxTemp: null }), day({ uvIndex: NaN })];
    // 1 usable, 1 passing → 100%.
    expect(computeProbability(rows, DEFAULT_THRESHOLDS)).toBe(100);
  });

  it("returns null on empty / undefined input", () => {
    expect(computeProbability([], DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeProbability(undefined, DEFAULT_THRESHOLDS)).toBeNull();
  });

  it("threshold boundaries (<=, >=) are inclusive", () => {
    const rows = [
      day({
        maxTemp: DEFAULT_THRESHOLDS.maxTemp,
        minTemp: DEFAULT_THRESHOLDS.minTemp,
        rainfall: DEFAULT_THRESHOLDS.rainfall,
        uvIndex: DEFAULT_THRESHOLDS.uvIndex,
      }),
    ];
    expect(computeProbability(rows, DEFAULT_THRESHOLDS)).toBe(100);
  });

  it("score and probability are independent: a day past threshold within buffer still earns score but fails probability", () => {
    const rows = [day({ maxTemp: 30 })]; // 2 over → linear penalty 25*(1-2/10) = 20 → 95 score; fails probability.
    expect(computeMonthlyScore(rows, DEFAULT_THRESHOLDS)).toBe(95);
    expect(computeProbability(rows, DEFAULT_THRESHOLDS)).toBe(0);
  });
});
