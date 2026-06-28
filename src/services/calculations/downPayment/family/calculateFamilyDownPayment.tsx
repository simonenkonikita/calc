// src/hooks/payment/downPayment/addContractAmount/Family/calculateFamilyDownPayment.ts
import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../utils/types";

interface CalculateFamilyDownPaymentParams {
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
  variables: Variables;
  bankOffer: BankOffer;
  remainingAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateFamilyDownPayment = (
  params: CalculateFamilyDownPaymentParams,
): number => {
  const {
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    isSpecialMortgageMode,
    coefficients,
    variables,
    bankOffer,
    remainingAmount,
    noSubsidyInflate,
  } = params;

  const limit = variables.familyMortgageLimit;
  const subsidyPercent = bankOffer.subsidyPercent;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);

  const contractAmountMinPV = contractAmount * (bankOffer.minPVPercent / 100);

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

  let downPaymentAmount: number;

  if (manualDownPayment > 0) {
    if (isWithinLimit) {
      downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
    } else {
      downPaymentAmount = Math.max(manualDownPayment, contractAmount - limit);
    }
  } else {
    if (isWithinLimit) {
      if (downPayment < userDesiredDownPayment) {
        downPaymentAmount = downPaymentFromContract;
      } else {
        if (downPayment >= downPaymentFromContract) {
          downPaymentAmount = downPayment;
        } else {
          downPaymentAmount = downPaymentFromContract;
        }
      }
    } else {
      downPaymentAmount = contractAmount - limit;
    }
  }

  return Math.ceil(downPaymentAmount);
};
