// src/hooks/payment/downPayment/addContractAmount/Family/calculateFamilyContractAmount.ts
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
  // 🔥 ОПРЕДЕЛЯЕМ ЛИМИТ ПО ФЛАГУ excessLimit
  const limit = bankOffer.excessLimit
    ? variables.maxFamilyMortgageSum || 15000000 // Если excessLimit true → 15 млн
    : variables.familyMortgageLimit || 6000000; // Иначе → 6 млн

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

  // Ранний возврат: если ипотека без ПВ невозможна
  if (isThresholdCondition && !isWithinLimit) {
    return null;
  }

  // Ранний возврат: если не завышаем на субсидию
  if (noSubsidyInflate) {
    if (isThresholdCondition) {
      return Math.ceil((objectCost - downPayment) / 0.799);
    }
    return Math.ceil(objectCost);
  }

  let contractAmount: number;

  if (isThresholdCondition) {
    contractAmount = summCreditWithoutPV;
  } else {
    if (isWithinLimit) {
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
