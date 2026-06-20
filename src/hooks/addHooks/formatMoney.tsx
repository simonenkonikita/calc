// ==========  функция-хелпер для безопасного форматирования==========

export const safeFormatMoney = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return "—";
  return formatMoney(amount);
};

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
