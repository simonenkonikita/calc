import {
  BankCoefficients,
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../../../utils/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ ДЛЯ 2 ДОГОВОРОВ ==========
export const calculateFamilyTwoContractAmount = (
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
  const limit = variables.familyMortgageLimit || 6000000;
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;

  const subsidyPercent = coefficients.subsidyPercent;

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;

  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  let summCredit: number;
  let isWithinLimit: boolean;
  let contractAmount: number;

  if (noSubsidyInflate && !isSpecialMortgageMode) {
    return {
      contractAmount: Math.ceil(objectCost),
    };
  }

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  }

  const effectiveSubsidyRate = subsidyPercent / 100;
  const summCreditFamilyTwo = objectCost * coefficients.requiredCoeffFamilyTwo;

  /*   const isThresholdCondition =
    isSpecialMortgageMode &&
    downPayment < summCreditWithoutPV * (userDownPaymentPercent / 100); */

  const baseContractAmount = objectCost + maxLimit * effectiveSubsidyRate;

  if (isSpecialMortgageMode) {
    if (noSubsidyInflate) {
      if (isWithinLimit) {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      }
    } else {
      if (isWithinLimit) {
        contractAmount = summCreditFamilyTwo / 0.799;
      } else {
        contractAmount = summCreditFamilyTwo / 0.799;
      }
    }
  } else {
    if (noSubsidyInflate) {
      contractAmount = Math.ceil(objectCost);
    } else {
      if (isWithinLimit) {
        if (downPayment <= userDesiredDownPayment) {
          contractAmount = summCreditFamilyTwo;
        } else {
          contractAmount = summCreditFamilyTwo;
        }
      } else {
        if (downPayment <= userDesiredDownPayment) {
          contractAmount =
            objectCost + (maxLimit - limit) * effectiveSubsidyRate;
        } else if (downPayment > baseContractAmount - maxLimit) {
          contractAmount = summCreditFamilyTwo;
        } else {
          contractAmount = summCreditFamilyTwo;
        }
      }
    }
  }

  return {
    contractAmount: Math.ceil(contractAmount),
  };
};
