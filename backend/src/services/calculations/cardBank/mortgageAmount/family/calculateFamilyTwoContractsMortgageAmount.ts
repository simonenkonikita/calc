// backend/src/services/calculations/bankProgram/steps/mortgageAmount/family/calculateFamilyTwoContractsMortgageAmount.ts

import { Offer } from "../../../../../entities/Offer";
import {
  Variables,
  BankCoefficients,
  MortgageAmountResult,
} from "../../../../../types/types";

interface calculateFamilyTwoContractsMortgageAmount {
  objectCost: number;
  contractAmount: number;
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number;
  userDownPaymentPercent: number;
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
}

export const calculateFamilyTwoContractsMortgageAmount = (
  params: calculateFamilyTwoContractsMortgageAmount,
): MortgageAmountResult => {
  const {
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    coefficients,
  } = params;

  const isIt = offer.programEntity?.type === "it";

  const limit = offer.minLoanAmount
    ? offer.minLoanAmount
    : isIt
      ? 9000000
      : 6000000;

  const maxLimit = offer.maxLoanAmount
    ? offer.maxLoanAmount
    : isIt
      ? 18000000
      : 15000000;

  const cafsummCred = 1 - userDownPaymentPercent / 100;

  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;

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

  let mortgageAmount: number = contractAmount - downPaymentAmount;
  let isLimitExceeded: boolean = false;

  // Разбивка на 2 договора
  const firstContractAmount = Math.min(
    mortgageAmount,
    variables.familyMortgageLimit,
  );
  const secondContractAmount = Math.max(
    0,
    mortgageAmount - variables.familyMortgageLimit,
  );

  if (isSpecialMortgageMode) {
    if (mortgageAmount < limit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    } else if (isWithinLimit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    } else {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    }
  } else {
    if (mortgageAmount < limit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    } else if (isWithinLimit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = false;
    } else {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = false;
    }
  }

  return {
    mortgageAmount: Math.ceil(mortgageAmount),
    firstContractAmount: Math.ceil(firstContractAmount),
    secondContractAmount: Math.ceil(secondContractAmount),
    isLimitExceeded,
  };
};
