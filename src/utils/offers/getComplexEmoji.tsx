export const getComplexEmoji = (name: string): string => {
  // Точное совпадение для "КП Солнечный"
  if (name === "КП Солнечный") {
    return "🏠";
  }
  return "🏢";
};
