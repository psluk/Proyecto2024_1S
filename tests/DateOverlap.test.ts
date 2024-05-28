import { describe, it, expect } from "vitest";
import { doDatesOverlap } from "../src/utils/DateOverlap";

describe("doDatesOverlap", () => {
  it("should return true when intervals overlap", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-10");
    const start2 = new Date("2023-01-05");
    const end2 = new Date("2023-01-15");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(true);
  });

  it("should return false when intervals do not overlap", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-10");
    const start2 = new Date("2023-01-11");
    const end2 = new Date("2023-01-20");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(false);
  });

  it("should return true when one interval is completely within the other", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-20");
    const start2 = new Date("2023-01-05");
    const end2 = new Date("2023-01-10");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(true);
  });

  it("should return false when intervals are exactly adjacent", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-10");
    const start2 = new Date("2023-01-10");
    const end2 = new Date("2023-01-20");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(false);
  });

  it("should return true when intervals have the same start date", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-10");
    const start2 = new Date("2023-01-01");
    const end2 = new Date("2023-01-05");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(true);
  });

  it("should return true when intervals have the same end date", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-10");
    const start2 = new Date("2023-01-05");
    const end2 = new Date("2023-01-10");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(true);
  });

  it("should return true when both intervals are the same", () => {
    const start1 = new Date("2023-01-01");
    const end1 = new Date("2023-01-10");
    const start2 = new Date("2023-01-01");
    const end2 = new Date("2023-01-10");
    const result = doDatesOverlap(start1, end1, start2, end2);
    expect(result).toBe(true);
  });
});
