import { describe, it, expect } from "vitest";
import {
  DEFAULT_THRESHOLDS,
  computeProbability,
  computeSuitabilityScore,
} from "../suitabilityScore";

const day = (overrides = {}) => ({
  maxTemp: 22,
  minTemp: 12,
  rainfall: 0,
  uvIndex: 5,
  ...overrides,
});

describe("computeProbability", () => {
  it("returns the rounded percentage of usable days meeting ALL four thresholds", () => {
    const rows = [
      day(),                       // passes
      day({ maxTemp: 29 }),        // > maxTemp default 28 — fails
      day({ minTemp: -1 }),        // < minTemp default 0 — fails
      day({ rainfall: 6 }),        // > rainfall default 5 — fails
      day(),                       // passes
    ];
    expect(computeProbability(rows, DEFAULT_THRESHOLDS)).toBe(40);
  });

  it("only counts rows with all four weather fields finite in the denominator", () => {
    const rows = [day(), day({ maxTemp: null }), day({ uvIndex: NaN })];
    expect(computeProbability(rows, DEFAULT_THRESHOLDS)).toBe(100);
  });

  it("returns null when the period has no usable days", () => {
    expect(computeProbability([], DEFAULT_THRESHOLDS)).toBeNull();
    expect(computeProbability(undefined, DEFAULT_THRESHOLDS)).toBeNull();
    expect(
      computeProbability([day({ rainfall: null })], DEFAULT_THRESHOLDS),
    ).toBeNull();
  });

  it("threshold boundaries are inclusive (<=, >=)", () => {
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

  it("tightening any threshold reduces (or leaves equal) the probability", () => {
    const rows = [
      day({ maxTemp: 24 }),
      day({ maxTemp: 26 }),
      day({ maxTemp: 28 }),
    ];
    const loose = computeProbability(rows, DEFAULT_THRESHOLDS);
    const tight = computeProbability(rows, {
      ...DEFAULT_THRESHOLDS,
      maxTemp: 22,
    });
    expect(tight).toBeLessThan(loose);
  });
});

describe("computeSuitabilityScore (climatology × passRate)", () => {
  it("returns the rounded product of climatology and passRate / 100", () => {
    // The Melbourne / October walkthrough: climatology 83, defaults give 94% pass.
    expect(computeSuitabilityScore(83, 94)).toBe(78);
  });

  it("equals the climatology when passRate is 100 (ceiling reached)", () => {
    expect(computeSuitabilityScore(83, 100)).toBe(83);
    expect(computeSuitabilityScore(50, 100)).toBe(50);
  });

  it("equals zero when passRate is zero (no day meets every threshold)", () => {
    expect(computeSuitabilityScore(83, 0)).toBe(0);
  });

  it("never exceeds the climatology ceiling (monotone in passRate)", () => {
    const climatology = 83;
    let prev = -1;
    for (let p = 0; p <= 100; p += 10) {
      const s = computeSuitabilityScore(climatology, p);
      expect(s).toBeLessThanOrEqual(climatology);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
  });

  it("returns null when climatology is null (station/month has no expert verdict)", () => {
    expect(computeSuitabilityScore(null, 50)).toBeNull();
  });

  it("returns null when passRate is null (no usable daily data)", () => {
    expect(computeSuitabilityScore(83, null)).toBeNull();
  });

  it("composes with computeProbability — the user's example: max temp 20→24 raises the score", () => {
    // A station whose actual maxTemp is 22 on every day.
    // climatology fixed at 83. Other three metrics always pass.
    const rows = [day({ maxTemp: 22 }), day({ maxTemp: 22 }), day({ maxTemp: 22 })];
    const before = computeSuitabilityScore(
      83,
      computeProbability(rows, { ...DEFAULT_THRESHOLDS, maxTemp: 20 }),
    );
    const after = computeSuitabilityScore(
      83,
      computeProbability(rows, { ...DEFAULT_THRESHOLDS, maxTemp: 24 }),
    );
    // At threshold 20: 22°C days all fail → passRate 0 → score 0.
    // At threshold 24: 22°C days all pass → passRate 100 → score 83.
    expect(before).toBe(0);
    expect(after).toBe(83);
    expect(after).toBeGreaterThan(before);
  });
});
