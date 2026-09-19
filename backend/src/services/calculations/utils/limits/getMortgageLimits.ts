// backend/src/utils/limits/getMortgageLimits.ts

import { Offer } from "../../../../entities/Offer";
import { Variables } from "../../../../types/types";

const DEFAULT_GOV_LIMITS = {
  family: { base: 6_000_000, max: 15_000_000 },
  it: { base: 9_000_000, max: 18_000_000 },
} as const;

export interface MortgageLimits {
  limit: number;
  maxLimit: number;
  effectiveLimit: number;
}

export const isItProgram = (offer: Offer): boolean => {
  return offer.programEntity?.type === "it";
};

export const getMortgageLimits = (
  offer: Offer,
  variables: Variables,
): MortgageLimits => {
  const isIt = isItProgram(offer);

  const limit = isIt
    ? (variables.itMortgageLimit ?? DEFAULT_GOV_LIMITS.it.base)
    : (variables.familyMortgageLimit ?? DEFAULT_GOV_LIMITS.family.base);

  const maxLimit = isIt
    ? (variables.maxItMortgageLimit ?? DEFAULT_GOV_LIMITS.it.max)
    : (variables.maxFamilyMortgageLimit ?? DEFAULT_GOV_LIMITS.family.max);

  const effectiveLimit = offer.isExcessLimit ? maxLimit : limit;

  return { limit, maxLimit, effectiveLimit };
};
