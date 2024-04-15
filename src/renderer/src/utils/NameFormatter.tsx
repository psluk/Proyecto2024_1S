export const getNameInitials = (name: string): string => {
  return name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};