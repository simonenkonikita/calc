// src/utils/badge/getMinExcessAmount.ts

import { BankProgramResultWithIndex } from "../types";

export const getMinExcessAmount = (
  offer: BankProgramResultWithIndex,
): number => {
  // ✅ Используем лимиты из офера
  if (offer.minLoanAmount) {
    return offer.minLoanAmount;
  }

  // 🔥 Если в офере нет лимита — используем дефолтные
  const isIt = offer.type === "it";
  return isIt ? 9000000 : 6000000;
};
