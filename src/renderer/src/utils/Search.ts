/**
 * Normalize a string to be used in search
 * @param string The string to normalize
 * @returns The normalized string
 */
function normalizeString(string: string): string {
  return string
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Check if a string contains a search
 * @param string The string to search
 * @param search The search
 * @returns If the string contains the search
 */
export function containsSearch(string: string, search: string): boolean {
  return (
    search !== "" && normalizeString(string).includes(normalizeString(search))
  );
}
