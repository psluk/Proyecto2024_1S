const dateLanguage: string[] = ["es-UY", "es-CR"]; // Returns "set" for September

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

/**
 * Converts a date to a local date string.
 * @param date An ISO string or a Date object.
 * @param dateType The type of date to return.
 * @returns The local date string.
 */
export const convertIsoStringToLocalDate = (
  date: string | Date,
  dateType: "hyphenated" | "natural",
): string => {
  try {
    const isoDate =
      typeof date === "string"
        ? new Date(date + (date.endsWith("Z") ? "" : "Z"))
        : date;
    const selectedOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: dateType === "hyphenated" ? "2-digit" : "long",
      day: "2-digit",
      weekday: dateType === "natural" ? "long" : undefined,
    };

    return isoDate.toLocaleDateString(dateLanguage, selectedOptions);
  } catch (error) {
    return "";
  }
};

/**
 * Converts a date to a local time string.
 * @param date An ISO string or a Date object.
 * @param is12Hour Whether to use 12-hour format.
 * @returns The local time string.
 */
export const convertDateToLocalTime = (
  date: string | Date,
  is12Hour: boolean = false,
): string => {
  try {
    const isoDate =
      typeof date === "string"
        ? new Date(date + (date.endsWith("Z") ? "" : "Z"))
        : date;
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: is12Hour,
    };

    const localString = isoDate.toLocaleTimeString(dateLanguage, timeOptions);

    if (is12Hour) {
      // Some browsers mistakenly return 00:00 a. m. for 12:00 a. m., so we replace it with 12:00 a. m.
      localString.replace(/^00/, "12");
    }

    return localString;
  } catch (error) {
    return "";
  }
};
