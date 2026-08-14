// backend/src/services/calculations/bankProgram/steps/calculateActualRate.ts

import { Offer } from "../../../../entities/Offer";
import { getDynamicRate } from "../../сoefficients/getDynamicRate";

interface CalculateActualRateParams {
  offer: Offer;
  manualDownPayment: number;
  objectCost: number;
  userDownPaymentPercent: number;
  mortgageAmount: number;
  loanTermYears: number;
}

export const calculateActualRate = (
  params: CalculateActualRateParams,
): number => {
  const {
    offer,
    manualDownPayment,
    objectCost,
    userDownPaymentPercent,
    mortgageAmount,
    loanTermYears,
  } = params;

  const pvForRate =
    manualDownPayment > 0 && objectCost > 0
      ? (manualDownPayment / objectCost) * 100
      : userDownPaymentPercent;

  const actualRate = getDynamicRate(
    offer,
    pvForRate,
    mortgageAmount,
    loanTermYears,
  );

  return actualRate;
};
