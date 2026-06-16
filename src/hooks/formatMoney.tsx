// ========== ФОРМАТИРОВАНИЕ ДЕНЕГ ==========
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (percent: number): string => {
  return `${percent.toFixed(2)}%`;
};
