// backend/src/services/calculations/coefficients/getDynamicRate.ts

import { Offer } from "../../../entities/Offer";
import { getDynamicValue } from "./getDynamicValue";

export const getDynamicRate = (
  offer: Offer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  return getDynamicValue(
    offer.dynamicRates || [],
    pvPercent,
    mortgageAmount,
    loanTerm,
    offer.rate,
    true,
  );
};
