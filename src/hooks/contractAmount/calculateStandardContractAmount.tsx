// ============================================================
// СТАНДАРТНЫЙ РАСЧЕТ ДЛЯ FULL И SHORT ПРОГРАММ

import { BankCoefficients, BankOffer, Variables } from "../../utils/types";

// ============================================================
export const calculateStandardContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  applyMinDownPayment: boolean,
  coefficients: BankCoefficients,
): number => {
  // Желание пользователя
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  // Требование банка
  const bankMinDownPayment = objectCost * (bankOffer.minPVPercent / 100);
  // Фактический минимальный ПВ
  const actualMinDownPayment = applyMinDownPayment
    ? bankMinDownPayment
    : userDesiredDownPayment;

  let contractAmount: number;

  // ============================================================
  // 1. ИПОТЕКА БЕЗ ПВ
  // ============================================================
  if (mortgageWithoutDownPayment) {
    const threshold =
      (remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment) *
      (userDownPaymentPercent / 100);

    if (downPayment < threshold) {
      if (noSubsidyInflate && mortgageWithoutDownPayment) {
        // $B$7/79.9*100
        contractAmount = (objectCost - downPayment) / 0.799;
      } else {
        // $B$14*L2+$B$7-$B$13
        contractAmount =
          remainingAmount * coefficients.requiredCoeffWithoutPV +
          objectCost -
          downPayment;
      }
    } else {
      contractAmount = objectCost;
    }
  } else {
    // ============================================================
    // 2. СТАНДАРТНЫЙ РАСЧЕТ
    // ============================================================
    // =ЕСЛИ($B$13<=$B$7*$B$8/100; $B$7/Сбербанк!J2; $B$14/Сбербанк!K2+$B$13)
    if (downPayment <= actualMinDownPayment) {
      contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
    } else {
      contractAmount =
        remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
    }
  }

  return Math.ceil(contractAmount);
};
