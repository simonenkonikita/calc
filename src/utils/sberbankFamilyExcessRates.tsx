import { MIN_EXCESS_MORTGAGE_AMOUNT_SBER } from "./constants";

// 🔥 Функция проверки валидности суммы для сверхлимита
export const isValidExcessAmount = (mortgageAmount: number): boolean => {
  return mortgageAmount >= MIN_EXCESS_MORTGAGE_AMOUNT_SBER;
};

// 🔥 Получение сообщения об ошибке
export const getExcessAmountError = (mortgageAmount: number): string | null => {
  if (mortgageAmount < MIN_EXCESS_MORTGAGE_AMOUNT_SBER) {
    return `⚠️ Минимальная сумма ипотеки для сверхлимитной программы ${MIN_EXCESS_MORTGAGE_AMOUNT_SBER.toLocaleString()} ₽`;
  }
  return null;
};
