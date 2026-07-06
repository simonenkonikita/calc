import {
  BankCoefficients,
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../../../utils/types";
import { calculateBankCoefficients } from "../../../сoefficients/calculateBankCoefficients";

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

  let summCredit: number;
  let isWithinLimit: boolean;

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  }

  const isThresholdCondition =
    isSpecialMortgageMode && downPayment < summCreditWithoutPV * cafsummPV;

  const baseContractAmount = objectCost + maxLimit * subsidyRate;

  let contractAmount: number;

  const summCreditFamilyTwo = objectCost * coefficients.requiredCoeffFamilyTwo;

  if (isThresholdCondition) {
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
            objectCost + (maxLimit - limit) * (subsidyPercent / 100);
        } else if (downPayment > baseContractAmount - maxLimit) {
          contractAmount = summCreditFamilyTwo;
        } else {
          contractAmount = summCreditFamilyTwo;
        }
      }
    }
  }

  const firstContractAmount = 6000000;

  const secondContractAmount =
    contractAmount * cafsummCred - firstContractAmount;

  console.log(
    `"2 договора"${contractAmount * cafsummCred}  ${secondContractAmount}`,
  );

  const actyalCoefficients = calculateBankCoefficients(
    variables,
    objectCost,
    bankOffer,
    userDownPaymentPercent,
    secondContractAmount,
  );

  let contractAmount1: number;

  const summCreditFamilyTwo2 =
    objectCost * actyalCoefficients.requiredCoeffFamilyTwo;

  if (isThresholdCondition) {
    if (noSubsidyInflate) {
      if (isWithinLimit) {
        contractAmount1 = Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        contractAmount1 = Math.ceil((objectCost - downPayment) / 0.799);
      }
    } else {
      if (isWithinLimit) {
        contractAmount1 = summCreditFamilyTwo2 / 0.799;
      } else {
        contractAmount1 = summCreditFamilyTwo2 / 0.799;
      }
    }
  } else {
    if (noSubsidyInflate) {
      contractAmount1 = Math.ceil(objectCost);
    } else {
      if (isWithinLimit) {
        if (downPayment <= userDesiredDownPayment) {
          contractAmount1 = summCreditFamilyTwo2;
        } else {
          contractAmount1 = summCreditFamilyTwo2;
        }
      } else {
        if (downPayment <= userDesiredDownPayment) {
          contractAmount1 =
            objectCost + (maxLimit - limit) * (subsidyPercent / 100);
        } else if (downPayment > baseContractAmount - maxLimit) {
          contractAmount1 = summCreditFamilyTwo2;
        } else {
          contractAmount1 = summCreditFamilyTwo2;
        }
      }
    }
  }
  console.log(
    `"2 договора"${contractAmount1 * cafsummCred}  ${secondContractAmount}`,
  );

  return {
    contractAmount: Math.ceil(contractAmount1),
  };
};
