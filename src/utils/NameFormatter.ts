const prepositions = ["a", "al", "la", "de", "para", "del", "y", "o", "e", "el"]

export const toNormalCase = (input: string, ignoreNonSignificative: boolean = false): string => {
  return input
    .split(" ")
    .map((word) => {
      if (ignoreNonSignificative && prepositions.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ").replaceAll(/\s+/g, " ").trim();
};
