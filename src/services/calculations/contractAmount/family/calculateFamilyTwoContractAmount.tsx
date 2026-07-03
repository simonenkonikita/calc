import {
  BankCoefficients,
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../../utils/types";

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
  const subsidyPercent = bankOffer.subsidyPercent;
  const subsidyRate = subsidyPercent / 100;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  const summCreditFamilyTwo = objectCost * coefficients.requiredCoeffFamilyTwo;

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

  const baseContractAmount = objectCost + limit * subsidyRate;

  let contractAmount: number;
  let isLimitExceeded: boolean = false;

  if (isThresholdCondition) {
    if (noSubsidyInflate) {
      if (isWithinLimit) {
        isLimitExceeded = true;
      } else {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      }
    } else if (isWithinLimit) {
      isLimitExceeded = true;
    } else {
      contractAmount =
        (objectCost * coefficients.requiredCoeffFamilyTwo) / 0.799;
    }
  } else {
    if (noSubsidyInflate) {
      contractAmount = Math.ceil(objectCost);
    } else if (isWithinLimit) {
      if (downPayment <= userDesiredDownPayment) {
        isLimitExceeded = true;
      } else {
        isLimitExceeded = true;
      }
    } else {
      if (downPayment <= userDesiredDownPayment) {
        contractAmount = objectCost + limit * (subsidyPercent / 100);
      } else if (downPayment > baseContractAmount - limit) {
        contractAmount =
          (objectCost - downPayment * subsidyRate) / (1 - subsidyRate);
      } else {
        contractAmount = baseContractAmount;
      }
    }
  }

  //РАБОТАЕМ НАД СУММАМИ В ДОГОВОРЕ

  return {
    contractAmount: Math.ceil(contractAmount),
    isLimitExceeded,
  };
};
