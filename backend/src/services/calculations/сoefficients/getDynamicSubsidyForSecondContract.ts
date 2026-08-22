// ============================================================
// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ СУБСИДИИ ПО ВТОРОМУ ДОГОВОРУ

import { Offer } from "../../../entities/Offer";
import { getDynamicSubsidy } from "./getDynamicSubsidy";

// ============================================================
export const getDynamicSubsidyForSecondContract = (
  offer: Offer,
  secondContractAmount: number,
  userDownPaymentPercent: number,
  loanTermYears: number,
): number => {
  // 🔥 Используем offer.dynamicSubsidies (из БД)
  if (offer.dynamicSubsidies && offer.dynamicSubsidies.length > 0) {
    // Передаем весь offer, а не только массив
    const result = getDynamicSubsidy(
      offer.dynamicSubsidies,
      userDownPaymentPercent,
      secondContractAmount,
      loanTermYears,
    );
    return result;
  }

  // Fallback: используем базовую субсидию
  return offer.subsidyPercent ?? 0;
};
