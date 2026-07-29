import { BankOffer } from "../../../../utils/types";
import { getDynamicRate } from "../../сoefficients/getDynamicRate";

interface CalculateActualRateParams {
  bankOffer: BankOffer;
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
    bankOffer,
    manualDownPayment,
    objectCost,
    userDownPaymentPercent,
    mortgageAmount,
    loanTermYears,
  } = params;

  // 1. Определяем ПВ для расчета ставки
  const pvForRate =
    manualDownPayment > 0 && objectCost > 0
      ? (manualDownPayment / objectCost) * 100
      : userDownPaymentPercent;

  // 2. Получаем актуальную ставку
  const actualRate = getDynamicRate(
    bankOffer,
    pvForRate,
    mortgageAmount,
    loanTermYears,
  );

  return actualRate;
};
