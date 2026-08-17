// backend/src/services/calculations/coefficients/getDynamicSubsidy.ts

import { Offer } from "../../../entities/Offer";
import { getDynamicValue } from "./getDynamicValue";

export const getDynamicSubsidy = (
  offer: Offer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  return getDynamicValue(
    offer.dynamicSubsidies || [],
    pvPercent,
    mortgageAmount,
    loanTerm,
    offer.subsidyPercent ?? 0,
    true,
  );
};
