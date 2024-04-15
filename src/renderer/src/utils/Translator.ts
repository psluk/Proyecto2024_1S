export const getTranslation = (
  dict: { [key: string]: string }[],
  value: string,
): string => {
  const translation = dict.find((item) => item.value === value);
  return translation ? translation.name : value;
};

export const getValue = (
  dict: { [key: string]: string }[],
  name: string,
): string => {
  const value = dict.find((item) => item.name === name);
  return value ? value.value : name;
};