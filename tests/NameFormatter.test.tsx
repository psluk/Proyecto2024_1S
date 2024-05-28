import { describe, it, expect } from "vitest";
import { getNameInitials } from "../src/renderer/src/utils/NameFormatter";

describe("getNameInitials", () => {
  it("should return the first initials of a single name", () => {
    const initials = getNameInitials("John");
    expect(initials).toBe("J");
  });

  it("should return the initials of a name with two words", () => {
    const initials = getNameInitials("John Doe");
    expect(initials).toBe("JD");
  });

  it("should return the first two initials of a name with more than two words", () => {
    const initials = getNameInitials("John Doe Smith");
    expect(initials).toBe("JD");
  });

  it("should return an empty string for an empty input", () => {
    const initials = getNameInitials("");
    expect(initials).toBe("");
  });

  it("should handle names with multiple spaces correctly", () => {
    const initials = getNameInitials("  John   Doe  ");
    expect(initials).toBe("JD");
  });

  it("should return the initials of a name with hyphenated words", () => {
    const initials = getNameInitials("Jean-Luc Picard");
    expect(initials).toBe("JP");
  });

  it("should handle names with special characters correctly", () => {
    const initials = getNameInitials("María-José Carreño Quiñones");
    expect(initials).not.toBe("MJ");
  });
});
