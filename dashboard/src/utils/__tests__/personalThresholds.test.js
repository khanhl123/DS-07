import { describe, it, expect } from "vitest";
import {
  DEFAULT_THRESHOLDS,
  evaluateThresholds,
} from "../personalThresholds";

const row = (overrides = {}) => ({
  maxTemp: 22,
  minTemp: 12,
  rainfall: 0,
  uvIndex: 5,
  marathonVerdict: { score: 80 },
  ...overrides,
});

describe("evaluateThresholds", () => {
  it("returns null score with helpful label when there are no usable rows", () => {
    const v = evaluateThresholds([], DEFAULT_THRESHOLDS);
    expect(v.score).toBeNull();
    expect(v.total).toBe(0);
    expect(v.passed).toBe(0);
    expect(v.scored).toBe(0);
    expect(v.statusLabel).toMatch(/no.*data/i);
  });

  it("treats undefined input the same as empty", () => {
    expect(evaluateThresholds(undefined, DEFAULT_THRESHOLDS).score).toBeNull();
  });

  it("excludes rows with any non-finite weather field from the denominator", () => {
    const rows = [
      row(),
      row({ maxTemp: null }),
      row({ rainfall: undefined }),
      row({ uvIndex: NaN }),
    ];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.total).toBe(1);
    expect(v.passed).toBe(1);
    expect(v.scored).toBe(1);
    expect(v.score).toBe(80);
  });

  it("a day fails if ANY of the four conditions is violated", () => {
    const rows = [
      row({ marathonVerdict: { score: 90 } }),
      row({ maxTemp: 29, marathonVerdict: { score: 50 } }),
      row({ minTemp: -1, marathonVerdict: { score: 50 } }),
      row({ rainfall: 6, marathonVerdict: { score: 50 } }),
      row({ uvIndex: 8, marathonVerdict: { score: 50 } }),
    ];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.total).toBe(5);
    expect(v.passed).toBe(1);
    expect(v.scored).toBe(1);
    expect(v.score).toBe(90);
  });

  it("boundary values are inclusive (<=, >=)", () => {
    const rows = [
      row({
        maxTemp: DEFAULT_THRESHOLDS.maxTemp,
        minTemp: DEFAULT_THRESHOLDS.minTemp,
        rainfall: DEFAULT_THRESHOLDS.rainfall,
        uvIndex: DEFAULT_THRESHOLDS.uvIndex,
      }),
    ];
    expect(evaluateThresholds(rows, DEFAULT_THRESHOLDS).passed).toBe(1);
  });

  it("score is the mean of marathonVerdict.score over passing rows", () => {
    const rows = [
      row({ marathonVerdict: { score: 60 } }),
      row({ marathonVerdict: { score: 80 } }),
      row({ marathonVerdict: { score: 100 } }),
    ];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.scored).toBe(3);
    expect(v.score).toBe(80);
  });

  it("passing rows without a verdict score count in passed but are dropped from the mean", () => {
    const rows = [
      row({ marathonVerdict: { score: 90 } }),
      row({ marathonVerdict: { score: null } }),
      row({ marathonVerdict: null }),
    ];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.passed).toBe(3);
    expect(v.scored).toBe(1);
    expect(v.score).toBe(90);
  });

  it("returns null score when no passing rows have a verdict", () => {
    const rows = [
      row({ marathonVerdict: null }),
      row({ marathonVerdict: { score: undefined } }),
    ];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.passed).toBe(2);
    expect(v.scored).toBe(0);
    expect(v.score).toBeNull();
    expect(v.statusLabel).toMatch(/no passing days/i);
  });

  it("tightening a single threshold drops the matching day and changes the mean", () => {
    const rows = [
      row({ maxTemp: 20, marathonVerdict: { score: 90 } }),
      row({ maxTemp: 26, marathonVerdict: { score: 60 } }),
    ];
    const loose = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(loose.scored).toBe(2);
    expect(loose.score).toBe(75);
    const tight = evaluateThresholds(rows, { ...DEFAULT_THRESHOLDS, maxTemp: 24 });
    expect(tight.scored).toBe(1);
    expect(tight.score).toBe(90);
  });

  it("score > 70 maps to suitable colour", () => {
    const rows = [row({ marathonVerdict: { score: 85 } })];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.score).toBe(85);
    expect(v.colour).toBe("var(--color-suitable)");
    expect(v.statusLabel).toMatch(/suitable/i);
  });

  it("score in (40, 70] maps to moderate colour", () => {
    const rows = [row({ marathonVerdict: { score: 55 } })];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.score).toBe(55);
    expect(v.colour).toBe("var(--color-moderate)");
    expect(v.statusLabel).toMatch(/mixed/i);
  });

  it("score <= 40 maps to unsuitable colour", () => {
    const rows = [row({ marathonVerdict: { score: 30 } })];
    const v = evaluateThresholds(rows, DEFAULT_THRESHOLDS);
    expect(v.score).toBe(30);
    expect(v.colour).toBe("var(--color-unsuitable)");
    expect(v.statusLabel).toMatch(/unsuitable/i);
  });

  it("boundary check: exact 70 lands in moderate, exact 71 lands in suitable", () => {
    const at70 = evaluateThresholds(
      [row({ marathonVerdict: { score: 70 } })],
      DEFAULT_THRESHOLDS,
    );
    expect(at70.statusLabel).toMatch(/mixed/i);
    const at71 = evaluateThresholds(
      [row({ marathonVerdict: { score: 71 } })],
      DEFAULT_THRESHOLDS,
    );
    expect(at71.statusLabel).toMatch(/suitable/i);
  });
});
