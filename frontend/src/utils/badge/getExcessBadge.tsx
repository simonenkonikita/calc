import { BankProgramResultWithIndex } from "../types";
import { getMaxExcessAmount, getMinExcessAmount } from "./getMinExcessAmount";

export const getExcessBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  // ✅ Проверяем, что это сверхлимитная программа
  const isExcessProgram =
    (offer.type === "family" || offer.type === "it") &&
    offer.isExcessLimit === true &&
    offer.isTwoContracts !== true;

  // ✅ Если НЕ сверхлимитная - вообще не показываем бейдж
  if (!isExcessProgram) {
    return null;
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
