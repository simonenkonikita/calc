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
  } = params;

  // 🔥 ОПРЕДЕЛЯЕМ ЛИМИТ ПО ФЛАГУ excessLimit
  const limit = bankOffer.excessLimit
    ? variables.maxFamilyMortgageSum || 15000000 // Если excessLimit true → 15 млн
    : variables.familyMortgageLimit || 6000000; // Иначе → 6 млн

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);

  const contractAmountMinPV = contractAmount * (bankOffer.minPVPercent / 100);

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

  // Если есть ручной ПВ
  if (isThresholdCondition) {
    if (manualDownPayment > 0) {
      if (isWithinLimit) {
        downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
      } else {
        downPaymentAmount = Math.max(manualDownPayment, contractAmount - limit);
      }
    } else {
      if (isWithinLimit) {
        downPaymentAmount = downPaymentFromContract;
      } else {
        downPaymentAmount = contractAmount - limit;
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
    downPaymentAmount = Math.max(manualDownPayment, contractAmount - limit);
  }
  return Math.ceil(downPaymentAmount);
};
