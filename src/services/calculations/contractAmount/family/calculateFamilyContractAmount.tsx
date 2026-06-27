import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../utils/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ДЛЯ СЕМЕЙНОЙ/ИТ ==========
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
): number => {
  const limit = variables.familyMortgageLimit; // Переменные!$B$1
  const subsidyPercent = bankOffer.subsidyPercent; // Сбербанк!E16
  // ============================================================
  // 1. ПРОВЕРКА: ВПИСЫВАЕТСЯ ЛИ В ЛИМИТ
  // ============================================================

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;

  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  // ============================================================
  // 2. ПРОВЕРКА: ВПИСЫВАЕТСЯ ЛИ В ЛИМИТ
  // ============================================================
  const summCreditLargePV =
    remainingAmount * coefficients.requiredCoeffWithLargePV + downPayment;

  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  /*   const summPVWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment; */

  let summCredit: number;
  let isWithinLimit: boolean;

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
  }

  let contractAmount: number;

  const isThresholdCondition =
    isSpecialMortgageMode && downPayment < summCreditWithoutPV * cafsummPV;

  if (isThresholdCondition) {
    if (isWithinLimit) {
      contractAmount = summCreditWithoutPV;
    } else {
      contractAmount = (objectCost + limit * (subsidyPercent / 100)) / 0.799;
    }
  } else {
    if (isWithinLimit) {
      if (downPayment <= userDesiredDownPayment) {
        contractAmount = summCreditMinPV;
      } else {
        contractAmount = summCreditLargePV;
      }
    }
  }
  return Math.ceil(contractAmount);
};
