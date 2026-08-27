import { BankProgramResultWithIndex } from "../types";
import { getMinExcessAmount } from "./getMinExcessAmount";
import { variables } from "../../data/limitdDate";

export const getExcessBadgeTwoContract = (
  offer: BankProgramResultWithIndex,
  isSpecialMortgageMode: boolean = false,
): { text: string; icon: string } | null => {
  const program = offer.program?.toLowerCase() || "";

  // 🔥 Проверяем, что это СВЕРХЛИМИТ с 2 договорами
  const isTwoContractExcess =
    program.includes("сверхлимит") &&
    (program.includes("2 договора") || program.includes("два договора"));

  if (!isTwoContractExcess) {
    return null;
  }

  if (isSpecialMortgageMode) {
    return {
      icon: "🚫",
      text: "Недоступна при ипотеке без ПВ",
    };
  }

  const isIt = program.includes("ит");

  const maxExcessAmount = isIt
    ? variables.maxItMortgageSum || 18000000
    : variables.maxFamilyMortgageSum || 15000000;

  const minExcessAmount = getMinExcessAmount(offer.bank, isIt);
  const mortgageAmount = offer.mortgageAmount || 0;

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
    text: `Сверхлимит (2 договора)`,
  };
};
