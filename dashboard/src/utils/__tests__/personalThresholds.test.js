import { describe, it, expect } from "vitest";
import {
  DEFAULT_THRESHOLDS,
  evaluateDays,
} from "../personalThresholds";

const row = (overrides = {}) => ({
  maxTemp: 22,
  minTemp: 12,
  rainfall: 0,
  uvIndex: 5,
  ...overrides,
});

describe("evaluateDays", () => {
  it("returns null score with helpful label when there are no usable rows", () => {
    const v = evaluateDays([], DEFAULT_THRESHOLDS);
    expect(v.score).toBeNull();
    expect(v.total).toBe(0);
    expect(v.statusLabel).toMatch(/no.*data/i);
  });

  it("treats undefined input the same as empty", () => {
    expect(evaluateDays(undefined, DEFAULT_THRESHOLDS).score).toBeNull();
  });

  it("excludes rows with any non-finite field from the denominator", () => {
    const rows = [
      row(),
      row({ maxTemp: null }),
      row({ rainfall: undefined }),
      row({ uvIndex: NaN }),
    ];
    const v = evaluateDays(rows, DEFAULT_THRESHOLDS);
    expect(v.total).toBe(1);
    expect(v.passed).toBe(1);
  });

  it("a day fails if ANY of the four conditions is violated", () => {
    const rows = [
      row(),
      row({ maxTemp: 29 }),
      row({ minTemp: -1 }),
      row({ rainfall: 6 }),
      row({ uvIndex: 8 }),
    ];
    const v = evaluateDays(rows, DEFAULT_THRESHOLDS);
    expect(v.total).toBe(5);
    expect(v.passed).toBe(1);
    expect(v.score).toBe(20);
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
    expect(evaluateDays(rows, DEFAULT_THRESHOLDS).passed).toBe(1);
  });

  it("maps score >= 65 to suitable colour", () => {
    const rows = Array.from({ length: 10 }, (_, i) =>
      i < 7 ? row() : row({ maxTemp: 35 }),
    );
    const v = evaluateDays(rows, DEFAULT_THRESHOLDS);
    expect(v.score).toBe(70);
    expect(v.colour).toBe("var(--color-suitable)");
    expect(v.statusLabel).toMatch(/suitable/i);
  });

  it("maps score in [40, 64] to moderate colour", () => {
    const rows = Array.from({ length: 10 }, (_, i) =>
      i < 5 ? row() : row({ maxTemp: 35 }),
    );
    const v = evaluateDays(rows, DEFAULT_THRESHOLDS);
    expect(v.score).toBe(50);
    expect(v.colour).toBe("var(--color-moderate)");
    expect(v.statusLabel).toMatch(/mixed/i);
  });

  it("maps score < 40 to unsuitable colour", () => {
    const rows = Array.from({ length: 10 }, (_, i) =>
      i < 3 ? row() : row({ maxTemp: 35 }),
    );
    const v = evaluateDays(rows, DEFAULT_THRESHOLDS);
    expect(v.score).toBe(30);
    expect(v.colour).toBe("var(--color-unsuitable)");
    expect(v.statusLabel).toMatch(/unsuitable/i);
  });

  it("exact 65 lands in suitable, exact 40 lands in moderate (boundary check)", () => {
    // 13 of 20 → 65
    const rows65 = Array.from({ length: 20 }, (_, i) =>
      i < 13 ? row() : row({ maxTemp: 35 }),
    );
    expect(evaluateDays(rows65, DEFAULT_THRESHOLDS).statusLabel).toMatch(/suitable/i);
    // 8 of 20 → 40
    const rows40 = Array.from({ length: 20 }, (_, i) =>
      i < 8 ? row() : row({ maxTemp: 35 }),
    );
    expect(evaluateDays(rows40, DEFAULT_THRESHOLDS).statusLabel).toMatch(/mixed/i);
  });
});
