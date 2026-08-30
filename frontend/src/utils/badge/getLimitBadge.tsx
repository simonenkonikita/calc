import { BankProgramResultWithIndex, ConfigData } from "../types";

export const getLimitBadge = (
  offer: BankProgramResultWithIndex,
  config: ConfigData | null,
): { text: string; icon: string } | null => {
  if (!config) {
    return null;
  }

  // ✅ Базовая программа: без сверхлимита, без 2-х договоров
  const isBaseProgram =
    (offer.type === "family" || offer.type === "it") &&
    offer.isTwoContracts !== true &&
    offer.isExcessLimit !== true;

  if (!isBaseProgram) {
    return null;
  }

  const limit =
    offer.type === "family"
      ? config.familyMortgageLimit || 6000000
      : config.itMortgageLimit || 9000000;

  const mortgageAmount = offer.mortgageAmount || 0;

  if (mortgageAmount > limit) {
    return {
      icon: "⚠️",
      text: `Максимальная сумма ${limit.toLocaleString()} ₽`,
    };
  }

  // ✅ В пределах лимита - НЕ показываем бейдж (возвращаем null)
  return {
    icon: "⚡",
    text: `Максимальная сумма ${limit.toLocaleString()} ₽`,
  };
};
