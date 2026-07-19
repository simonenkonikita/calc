import { variables } from "../../data/limitdDate";
import { BankProgramResultWithIndex } from "../types";

export const getLimitBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  // Проверяем, что это сверхлимитная программа
  const isExcessProgram =
    offer.program === "Семейная базовая" ||
    offer.program === "Семейная ипотека 3,5%";

  if (!isExcessProgram) {
    return null;
  }

  const familyMortgageLimit = variables.familyMortgageLimit || 6000000;
  const mortgageAmount = offer.mortgageAmount || 0;

  if (mortgageAmount > familyMortgageLimit) {
    return {
      icon: "⚠️",
      text: `Максимальная сумма ипотеки ${familyMortgageLimit.toLocaleString()} ₽`,
    };
  }

  // Сумма в допустимом диапазоне - показываем обычный шильдик
  return {
    icon: "⚡",
    text: `Максимальная сумма ипотеки ${familyMortgageLimit.toLocaleString()} ₽`,
  };
};
