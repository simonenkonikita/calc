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
  // Расчеты для условий
  const limit = variables.familyMortgageLimit; // Переменные!$B$1 (6 000 000)
  const subsidyPercent = bankOffer.subsidyPercent; // Сбербанк!E16

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;

  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;

  const summCreditLargePV =
    remainingAmount * coefficients.requiredCoeffWithLargePV + downPayment;

  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  const summPVWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  let summCredit: number;
  let isWithinLimit: boolean;

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
    console.log(`'сумма кредита с ПВ'${summCredit}`);
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
    console.log(`'сумма кредита с ПВ'${summCredit}`);
  }

  let contractAmount: number;

  const isThresholdCondition =
    isSpecialMortgageMode && downPayment < summCreditWithoutPV * cafsummPV;

  if (isThresholdCondition) {
    contractAmount = summCreditWithoutPV;
  } else {
    if (downPayment <= userDesiredDownPayment) {
      contractAmount = summCreditMinPV;
    } else {
      contractAmount = summCreditLargePV;
    }
  }

  if (isSpecialMortgageMode) {
    if (!isWithinLimit) {
      if (noSubsidyInflate) {
        return objectCost;
      }
      return objectCost + limit * (subsidyPercent / 100);
    }
    if (downPayment < summPVWithoutPV * cafsummPV) {
      if (noSubsidyInflate && isSpecialMortgageMode) {
        return (objectCost - downPayment) / 0.799;
      } else {
        return objectCost / coefficients.requiredCoeffWithMinPV;
      }
    }
  }

  return Math.ceil(contractAmount);
};
