import { BankProgramResultWithIndex } from "../types";
import { getMaxExcessAmount, getMinExcessAmount } from "./getMinExcessAmount";

export const getExcessBadgeTwoContract = (
  offer: BankProgramResultWithIndex,
  isSpecialMortgageMode: boolean = false,
): { text: string; icon: string } | null => {
  const isExcessProgram =
    (offer.type === "family" || offer.type === "it") &&
    offer.isTwoContracts === true &&
    offer.isExcessLimit !== true;

  if (!isExcessProgram) {
    return null;
  }

  if (isSpecialMortgageMode) {
    return {
      icon: "🚫",
      text: "Недоступна при ипотеке без ПВ",
    };
  }

  // ✅ Теперь мы уверены, что это сверхлимитная программа
  // Можно показывать предупреждения
  const minExcessAmount = getMinExcessAmount(offer);
  const maxExcessAmount = getMaxExcessAmount(offer);
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
      icon: "🚫",
      text: `Максимальная сумма ${maxExcessAmount.toLocaleString()} ₽`,
    };
  }

  // Сумма в допустимом диапазоне - показываем обычный шильдик
  return {
    icon: "⚡",
    text: `Сверхлимит`,
  };
};
