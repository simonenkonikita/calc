import { BankProgramResultWithIndex } from "../types";
import { getMinExcessAmount } from "./getMinExcessAmount";
import { variables } from "../../data/limitdDate";

export const getExcessBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  // Проверяем, что это сверхлимитная программа
  const program = offer.program?.toLowerCase() || "";

  const isExcessProgram = program.includes("сверхлимит");

  if (!isExcessProgram) {
    return null;
  }

  // 🔥 ИСПРАВЛЕНО: определяем ИТ-программу по наличию "ит" в названии
  const isIt = program.includes("ит");

  const maxExcessAmount = isIt
    ? variables.maxItMortgageSum || 18000000
    : variables.maxFamilyMortgageSum || 15000000;

  const minExcessAmount = getMinExcessAmount(offer.bank, isIt);
  const mortgageAmount = offer.mortgageAmount || 0;

  // Сообщения в зависимости от суммы
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

  return {
    icon: "⚡",
    text: `Сверхлимит`,
  };
};
