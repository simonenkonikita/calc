import {
  BankCoefficients,
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../../../utils/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ДЛЯ СЕМЕЙНОЙ ==========
export const calculateFamilyExcessLimitContractAmount = (
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
  const limit = variables.maxFamilyMortgageSum || 15000000;

  const subsidyPercent = bankOffer.subsidyPercent;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

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

  const baseContractAmount = objectCost + limit * (subsidyPercent / 100);
  const subsidyRate = subsidyPercent / 100;

  let contractAmount: number;

  if (isThresholdCondition) {
    if (noSubsidyInflate) {
      if (isWithinLimit) {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      }
    } else {
      if (isWithinLimit) {
        contractAmount = summCreditWithoutPV;
      } else {
        contractAmount = summCreditWithoutPV;
      }
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

  return {
    contractAmount: Math.ceil(contractAmount),
  };
};
