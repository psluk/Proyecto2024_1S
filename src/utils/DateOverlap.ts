/**
 * Checks if two dates overlap
 * @param start1 The start date of the first interval
 * @param end1 The end date of the first interval
 * @param start2 The start date of the second interval
 * @param end2 The end date of the second interval
 * @returns `true` if the intervals overlap, `false` otherwise
 */
export const doDatesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean => {
  return start1 < end2 && start2 < end1;
};
