// ============================================================
// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ СУБСИДИИ ПО ВТОРОМУ ДОГОВОРУ

import { BankOffer } from "../../../utils/types";
import { getDynamicSubsidy } from "./getDynamicSubsidy";

// ============================================================
export const getDynamicSubsidyForSecondContract = (
  bankOffer: BankOffer,
  secondContractAmount: number,
  userDownPaymentPercent: number,
  loanTermYears: number,
): number => {
  // Проверяем, есть ли динамические субсидии для второго договора
  if (
    bankOffer.twoContractSubsidies &&
    bankOffer.twoContractSubsidies.length > 0
  ) {
    // Используем существующую логику getDynamicSubsidy с переданной суммой второго договора
    const result = getDynamicSubsidy(
      {
        ...bankOffer,
        dynamicSubsidyPercent: bankOffer.twoContractSubsidies,
      },
      userDownPaymentPercent,
      secondContractAmount,
      loanTermYears,
    );
    return result;
  }

  // Fallback: используем базовую субсидию
  return bankOffer.subsidyPercent || 0;
};
