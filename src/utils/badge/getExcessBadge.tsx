// src/utils/getExcessBadge.ts
import { BankProgramResultWithIndex } from "../types";
import { MIN_EXCESS_MORTGAGE_AMOUNT_SBER } from "../constants";

export const getExcessBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  // Проверяем по наличию поля excessLimit или по названию программы
  if (
    offer.program?.toLowerCase().includes("сверхлимит") ||
    offer.program === "Семейная ипотека сверхлимит" ||
    offer.program === "ИТ ипотека сверхлимит"
  ) {
    return {
      icon: "⚡",
      text: `Сумма от ${MIN_EXCESS_MORTGAGE_AMOUNT_SBER.toLocaleString()} ₽`,
    };
  }
  return null;
};
