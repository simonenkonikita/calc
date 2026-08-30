import { Offer } from "../../../../../entities/Offer";
import {
  BankCoefficients,
  Variables,
  BankOffer,
} from "../../../../../types/types";

interface CalculateFamilyDownPaymentParams {
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
    offer,
    remainingAmount,
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
    downPaymentAmount = Math.max(manualDownPayment, contractAmount - limit);
  }
  return Math.ceil(downPaymentAmount);
};
