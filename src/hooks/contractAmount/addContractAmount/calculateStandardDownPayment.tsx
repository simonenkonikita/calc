// src/hooks/payment/downPayment/calculateStandardDownPayment.ts

import { MIN_DOWN_PAYMENT_PERCENT } from "../../../utils/constants";

interface StandardDownPaymentParams {
  contractAmount: number;
  contractAmountMinPV: number;
  downPaymentFromContract: number;
  downPayment: number;
  manualDownPayment: number;
  mortgageWithoutDownPayment: boolean;
  userDownPaymentPercent: number;
}

/**
 * Стандартный расчет суммы ПВ (для full, short программ)
 */
export const calculateStandardDownPayment = (
  params: StandardDownPaymentParams,
): number => {
  const {
    contractAmountMinPV,
    downPaymentFromContract,
    downPayment,
    manualDownPayment,
    mortgageWithoutDownPayment,
    userDownPaymentPercent,
  } = params;

  let downPaymentAmount: number;

  if (mortgageWithoutDownPayment) {
    downPaymentAmount = contractAmountMinPV;
  } else if (manualDownPayment > 0) {
    downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
  } else if (userDownPaymentPercent > MIN_DOWN_PAYMENT_PERCENT) {
    downPaymentAmount = downPaymentFromContract;
  } else if (downPayment >= contractAmountMinPV) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = contractAmountMinPV;
  }

  return Math.ceil(downPaymentAmount);
};
