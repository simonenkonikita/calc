import { Offer } from "../../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../../types/types";

interface developerAccountParams {
  objectCost: number; // $B$7 / E32
  ownFunds: number; // $B$13 / J32
  downPayment: number;
  remainingAmount: number;
  mortgageAmount: number; // $B$14 / D32
  subsidyAmount: number; // C32
  contractAmount: number; // I32
  userDownPaymentPercent: number; // $B$8
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean; // $L$10
  downPaymentAmount: number;
  noSubsidyInflate: boolean;
  coefficients: BankCoefficients;
}

export const developerAccount = (params: developerAccountParams): number => {
  const {
    objectCost,
    ownFunds,
    downPayment,
    remainingAmount,
    mortgageAmount,
    subsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    coefficients,
  } = params;

  const isIt = offer.programEntity?.type === "it";

  const limit = offer.isExcessLimit
    ? isIt
      ? variables.maxItMortgageLimit || 18000000
      : variables.maxFamilyMortgageLimit || 15000000
    : isIt
      ? variables.itMortgageLimit || 9000000
      : variables.familyMortgageLimit || 6000000;

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
    isWithinLimit = summCredit <= limit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
  }

  let developerAccount: number;

  if (isSpecialMortgageMode) {
    if (isWithinLimit) {
      developerAccount = ownFunds + mortgageAmount - subsidyAmount;
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  } else {
    if (isWithinLimit) {
      developerAccount = contractAmount - subsidyAmount;
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  }
  return Math.ceil(developerAccount);
};
