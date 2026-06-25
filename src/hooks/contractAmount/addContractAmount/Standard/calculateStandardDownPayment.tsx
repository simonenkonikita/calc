// src/hooks/payment/downPayment/calculateStandardDownPayment.ts

import { MIN_DOWN_PAYMENT_PERCENT } from "../../../../utils/constants";

interface StandardDownPaymentParams {
  contractAmount: number;
  contractAmountMinPV: number;
  downPaymentFromContract: number;
  downPayment: number;
  manualDownPayment: number;
  mortgageWithoutDownPayment: boolean;
  userDownPaymentPercent: number;
  objectCost: number;
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
    objectCost,
  } = params;

  let downPaymentAmount: number;

  if (mortgageWithoutDownPayment) {
    downPaymentAmount = contractAmountMinPV;
  } else if (manualDownPayment > 0) {
    // ============================================================
    // РУЧНОЙ ВВОД ПВ — проверяем границы
    // ============================================================

    // 1. Проверяем, что ПВ не превышает стоимость объекта
    if (manualDownPayment > objectCost) {
      // Если превышает — возвращаем минимальный ПВ
      downPaymentAmount = contractAmountMinPV;
    }
    // 2. Проверяем, что ПВ не меньше минимального
    else if (manualDownPayment < contractAmountMinPV) {
      downPaymentAmount = contractAmountMinPV;
    }
    // 3. Иначе возвращаем ручной ввод
    else {
      downPaymentAmount = manualDownPayment;
    }
  } else if (userDownPaymentPercent > MIN_DOWN_PAYMENT_PERCENT) {
    downPaymentAmount = downPaymentFromContract;
  } else if (downPayment >= contractAmountMinPV) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = contractAmountMinPV;
  }

  return Math.ceil(downPaymentAmount);
};
