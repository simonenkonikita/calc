import { isTrancheAvailable } from "../tranche/trancheDates";
import { BankProgramResultWithIndex } from "../types";

// ✅ Функция для получения шильдика (бейджа) для банка
export const getTrancheBadge = (
  offer: BankProgramResultWithIndex,
  complexName: string,
): { text: string; icon: string } | null => {
  if (offer.bank === "Сбербанк" && offer.program === "Траншевая ипотека") {
    // Проверяем доступность
    if (complexName && !isTrancheAvailable(complexName)) {
      return {
        icon: "❌",
        text: "Траншевая ипотека недопустима",
      };
    }
    return {
      icon: "📅",
      text: "Траншевая ипотека",
    };
  }
  return null;
};
