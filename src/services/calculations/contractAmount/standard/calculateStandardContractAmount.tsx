import {
  BankOffer,
  Variables,
  BankCoefficients,
  ContractAmountResult,
} from "../../../../utils/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateStandardContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  coefficients: BankCoefficients,
): ContractAmountResult => {
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  // 1. НЕ ЗАВЫШАТЬ НА СУБСИДИЮ
  if (noSubsidyInflate && !mortgageWithoutDownPayment) {
    return {
      contractAmount: Math.ceil(objectCost),
      isLimitExceeded: false,
    };
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
        return {
          contractAmount: Math.ceil((objectCost - downPayment) / 0.799),
          isLimitExceeded: false,
        };
      } else {
        return {
          contractAmount: Math.ceil(
            remainingAmount * coefficients.requiredCoeffWithoutPV +
              objectCost -
              downPayment,
          ),
          isLimitExceeded: false,
        };
      }
    }
  }

  let contractAmount: number;

  // 3. РАСЧЕТ СУММЫ В ДОГОВОРЕ
  // =ЕСЛИ($B$13<=$B$7*$B$8/100; $B$7/Сбербанк!J2; $B$14/Сбербанк!K2+$B$13)
  if (downPayment <= userDesiredDownPayment) {
    // ✅ ПРАВИЛЬНАЯ ФОРМУЛА - используем requiredCoeffWithMinPV
    contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
  } else {
    contractAmount =
      remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
  }

  return {
    contractAmount: Math.ceil(contractAmount),
    isLimitExceeded: false,
  };
};
