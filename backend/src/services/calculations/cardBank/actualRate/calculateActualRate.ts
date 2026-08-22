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

  // Рассчитываем ПВ для ставки
  const pvForRate =
    manualDownPayment > 0 && objectCost > 0
      ? (manualDownPayment / objectCost) * 100
      : userDownPaymentPercent;

  // 🔥 Передаем массив dynamicRates, а не весь offer
  const actualRate = getDynamicRate(
    offer.dynamicRates || [], // массив DynamicRate[]
    pvForRate,
    mortgageAmount,
    loanTermYears,
    offer.rate, // дефолтная ставка
  );

  return actualRate;
};
