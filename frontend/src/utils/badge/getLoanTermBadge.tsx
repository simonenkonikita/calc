// src/utils/badge/getLoanTermBadge.ts

import { BankProgramResultWithIndex } from "../types";

export const getLoanTermBadge = (
  offer: BankProgramResultWithIndex,
  loanTermYears: number,
): { text: string; icon: string } | null => {
  if (offer.type === "short" && offer.durationMonths) {
    if (offer.minLoanTermYears && loanTermYears < offer.minLoanTermYears) {
      return {
        text: `Только при сроке ипотеки от ${offer.minLoanTermYears} лет`,
        icon: "⏳",
      };
    }
  }
  return null;
};
