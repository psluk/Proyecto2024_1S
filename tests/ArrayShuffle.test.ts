import { describe, it, expect } from "vitest";
import { shuffleArray } from "../src//utils/Shuffle";

describe("shuffleArray", () => {
  it("should return an array with the same elements", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(array);

    expect(shuffledArray).toHaveLength(array.length);
    expect(shuffledArray).toEqual(expect.arrayContaining(array));
  });

  it("should not mutate the original array", () => {
    const array = [1, 2, 3, 4, 5];
    const arrayCopy = array.slice();
    shuffleArray(array);

    expect(array).toEqual(arrayCopy);
  });

  it("should return a different order of elements", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(array);

    // It's possible but unlikely that the order remains the same
    expect(shuffledArray).not.toEqual(array);
  });

  it("should handle an empty array", () => {
    const array: number[] = [];
    const shuffledArray = shuffleArray(array);

    expect(shuffledArray).toEqual([]);
  });

  it("should handle an array with one element", () => {
    const array = [1];
    const shuffledArray = shuffleArray(array);

    expect(shuffledArray).toEqual([1]);
  });

  it("should return a shuffled array of strings", () => {
    const array = ["a", "b", "c", "d", "e"];
    const shuffledArray = shuffleArray(array);

    expect(shuffledArray).toHaveLength(array.length);
    expect(shuffledArray).toEqual(expect.arrayContaining(array));
  });

  it("should return a shuffled array of objects", () => {
    const array = [{ key: 1 }, { key: 2 }, { key: 3 }];
    const shuffledArray = shuffleArray(array);

    expect(shuffledArray).toHaveLength(array.length);
    expect(shuffledArray).toEqual(expect.arrayContaining(array));
  });
});
