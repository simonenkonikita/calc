import { BankProgramResultWithIndex } from "../types";
import { getMinExcessAmount } from "./getMinExcessAmount";
import { variables } from "../../data/limitdDate";

export const getExcessBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  // Проверяем, что это сверхлимитная программа
  const isExcessProgram =
    offer.program?.toLowerCase().includes("сверхлимит") ||
    offer.program === "Семейная ипотека сверхлимит" ||
    offer.program === "ИТ ипотека сверхлимит";

  if (!isExcessProgram) {
    return null;
  }

  const minExcessAmount = getMinExcessAmount(offer.bank);
  const maxExcessAmount = variables.maxFamilyMortgageSum || 15000000;
  const mortgageAmount = offer.mortgageAmount || 0;

  // 🔥 Разные сообщения в зависимости от суммы
  if (mortgageAmount < minExcessAmount) {
    return {
      icon: "⚠️",
      text: `Минимальная сумма ${minExcessAmount.toLocaleString()} ₽`,
    };
  }

  if (mortgageAmount > maxExcessAmount) {
    return {
      icon: "⚠️",
      text: `Максимальная сумма ${maxExcessAmount.toLocaleString()} ₽`,
    };
  }

  // Сумма в допустимом диапазоне - показываем обычный шильдик
  return {
    icon: "⚡",
    text: `Cерхлимит`,
  };
};
