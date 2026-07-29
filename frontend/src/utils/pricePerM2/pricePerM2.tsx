export const calculatePricePerM2 = (
  developerAccount: number,
  area: number,
): number | null => {
  if (area <= 0) {
    return null;
  }
  return developerAccount / area;
};
