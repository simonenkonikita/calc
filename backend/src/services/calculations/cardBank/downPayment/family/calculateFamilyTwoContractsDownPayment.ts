// src/hooks/payment/downPayment/addContractAmount/Family/calculateFamilyDownPayment.ts

import { Offer } from "../../../../../entities/Offer";
import {
  BankCoefficients,
  Variables,
  BankOffer,
} from "../../../../../types/types";

interface calculateFamilyTwoContractsDownPayment {
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
  variables: Variables;
  offer: Offer;
  remainingAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateFamilyTwoContractsDownPayment = (
  params: calculateFamilyTwoContractsDownPayment,
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
    offer,
    remainingAmount,
  } = params;

  // 🔥 ОПРЕДЕЛЯЕМ ЛИМИТ ПО ФЛАГУ excessLimit
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);

  const contractAmountMinPV = contractAmount * (offer.minPVPercent / 100);

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

  let downPaymentAmount: number;

  if (isThresholdCondition) {
    if (manualDownPayment > 0) {
      if (isWithinLimit) {
        downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
      } else {
        downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
      }
    } else {
      if (isWithinLimit) {
        downPaymentAmount = downPaymentFromContract;
      } else {
        downPaymentAmount = contractAmountMinPV;
      }
    }
  } else {
    if (isWithinLimit) {
      if (downPayment < userDesiredDownPayment) {
        return downPaymentFromContract;
      }
      return downPayment >= downPaymentFromContract
        ? downPayment
        : downPaymentFromContract;
    }
    downPaymentAmount = Math.max(manualDownPayment, contractAmount - maxLimit);
  }
  return Math.ceil(downPaymentAmount);
};
