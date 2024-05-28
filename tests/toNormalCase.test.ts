import { describe, it, expect } from "vitest";
import { toNormalCase } from "../src/utils/NameFormatter";

describe("toNormalCase", () => {
  it("should capitalize the first letter of each word", () => {
    const result = toNormalCase("hello world");
    expect(result).toBe("Hello World");
  });

  it("should handle mixed case input correctly", () => {
    const result = toNormalCase("hELLo WoRLd");
    expect(result).toBe("Hello World");
  });

  it("should handle multiple spaces correctly", () => {
    const result = toNormalCase("  hello   world  ");
    expect(result).toBe("Hello World");
  });

  it("should not capitalize prepositions when ignoreNonSignificative is true", () => {
    const result = toNormalCase("el perro y el gato", true);
    expect(result).toBe("el Perro y el Gato");
  });

  it("should capitalize prepositions when ignoreNonSignificative is false", () => {
    const result = toNormalCase("el perro y el gato", false);
    expect(result).toBe("El Perro Y El Gato");
  });

  it("should handle empty input", () => {
    const result = toNormalCase("");
    expect(result).toBe("");
  });

  it("should handle input with only spaces", () => {
    const result = toNormalCase("    ");
    expect(result).toBe("");
  });

  it("should handle a single word", () => {
    const result = toNormalCase("hello");
    expect(result).toBe("Hello");
  });

  it("should handle prepositions in mixed case when ignoreNonSignificative is true", () => {
    const result = toNormalCase("El pErRo Y El GaTo", true);
    expect(result).toBe("el Perro y el Gato");
  });

  it("should handle prepositions in mixed case when ignoreNonSignificative is false", () => {
    const result = toNormalCase("El pErRo Y El GaTo", false);
    expect(result).toBe("El Perro Y El Gato");
  });
});
