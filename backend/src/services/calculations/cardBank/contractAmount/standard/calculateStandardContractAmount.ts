import {
  BankOffer,
  Variables,
  BankCoefficients,
  ContractAmountResult,
} from "../../../../../types/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateStandardContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
): ContractAmountResult => {
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  let contractAmount: number;

  if (noSubsidyInflate && !isSpecialMortgageMode) {
    return {
      contractAmount: Math.ceil(objectCost),
    };
  }

  if (isSpecialMortgageMode) {
    const threshold =
      (remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment) *
      (userDownPaymentPercent / 100);

    if (downPayment < threshold) {
      if (noSubsidyInflate && isSpecialMortgageMode) {
        return {
          contractAmount: Math.ceil((objectCost - downPayment) / 0.799),
        };
      } else {
        return {
          contractAmount: Math.ceil(
            remainingAmount * coefficients.requiredCoeffWithoutPV +
              objectCost -
              downPayment,
          ),
        };
      }
    }
  }

  if (downPayment <= userDesiredDownPayment) {
    contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
  } else {
    contractAmount =
      remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
  }

  return {
    contractAmount: Math.ceil(contractAmount),
  };
};
