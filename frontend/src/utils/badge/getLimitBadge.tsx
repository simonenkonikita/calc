import { variables } from "../../data/limitdDate";
import { BankProgramResultWithIndex } from "../types";

export const getLimitBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  // Проверяем, что это семейная или ИТ-программа (БЕЗ сверхлимита)
  const program = offer.program?.toLowerCase() || "";

  const isFamily =
    program.includes("семейная") && !program.includes("сверхлимит");

  const isIt = program.includes("ит") && !program.includes("сверхлимит");

  if (!isFamily && !isIt) {
    return null;
  }

  const isItProgram = isIt;
  const limit = isItProgram
    ? variables.itMortgageLimit || 9000000
    : variables.familyMortgageLimit || 6000000;

  const mortgageAmount = offer.mortgageAmount || 0;

  // 🔥 ПОКАЗЫВАЕМ БЕЙДЖ ТОЛЬКО ЕСЛИ СУММА ПРЕВЫШАЕТ ЛИМИТ!
  if (mortgageAmount > limit) {
    return {
      icon: "⚠️",
      text: `Максимальная сумма ипотеки ${limit.toLocaleString()} ₽`,
    };
  }

  // 🔥 Если сумма в пределах лимита — бейдж НЕ ПОКАЗЫВАЕМ
  return null;
};
