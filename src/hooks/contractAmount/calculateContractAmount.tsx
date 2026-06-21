import { BankOffer, Variables } from "../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  applyMinDownPayment: boolean,
): number => {
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const bankMinDownPayment = objectCost * (bankOffer.minPVPercent / 100);
  const actualMinDownPayment = applyMinDownPayment
    ? bankMinDownPayment
    : userDesiredDownPayment;

  // 1. НЕ ЗАВЫШАТЬ НА СУБСИДИЮ
  if (noSubsidyInflate && !mortgageWithoutDownPayment) {
    return Math.ceil(objectCost);
  }

  // 2. ИПОТЕКА БЕЗ ПВ
  if (mortgageWithoutDownPayment) {
    const threshold =
      (remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment) *
      (userDownPaymentPercent / 100);

    if (downPayment < threshold) {
      if (noSubsidyInflate && mortgageWithoutDownPayment) {
        return Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        return Math.ceil(
          remainingAmount * coefficients.requiredCoeffWithoutPV +
            objectCost -
            downPayment,
        );
      }
    }
  }

  let contractAmount: number;

  // 3. РАСЧЕТ СУММЫ В ДОГОВОРЕ
  // =ЕСЛИ($B$13<=$B$7*$B$8/100; $B$7/Сбербанк!J2; $B$14/Сбербанк!K2+$B$13)
  if (downPayment <= actualMinDownPayment) {
    // ✅ ПРАВИЛЬНАЯ ФОРМУЛА - используем requiredCoeffWithMinPV
    contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
  } else {
    contractAmount =
      remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
  }

  return Math.ceil(contractAmount);
};
