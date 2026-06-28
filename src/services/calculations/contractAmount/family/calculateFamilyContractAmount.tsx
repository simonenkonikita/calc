import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../utils/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ДЛЯ СЕМЕЙНОЙ ==========
export const calculateFamilyContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
): number | null => {
  // 🔥 Меняем тип возврата, так как может быть null
  const limit = variables.familyMortgageLimit;
  const subsidyPercent = bankOffer.subsidyPercent;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const summCreditLargePV =
    remainingAmount * coefficients.requiredCoeffWithLargePV + downPayment;

  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  let summCredit: number;
  let isWithinLimit: boolean;

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
  }

  const isThresholdCondition =
    isSpecialMortgageMode && downPayment < summCreditWithoutPV * cafsummPV;

  let contractAmount: number;

  if (isThresholdCondition) {
    if (noSubsidyInflate) {
      contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
    } else if (isWithinLimit) {
      contractAmount = summCreditWithoutPV;
    } else {
      return null;
    }
  } else {
    if (noSubsidyInflate) {
      contractAmount = Math.ceil(objectCost);
    } else if (isWithinLimit) {
      if (downPayment <= userDesiredDownPayment) {
        contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
      } else {
        contractAmount =
          remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
      }
    } else {
      contractAmount = objectCost + limit * (subsidyPercent / 100);
    }
  }

  return Math.ceil(contractAmount);
};
