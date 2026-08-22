import { Offer } from "../../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../../types/types";

interface clientContribution {
  objectCost: number; // $B$7
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number; // D32 (сумма ПВ)
  ownFunds: number; // E32 (собственные средства)
  userDownPaymentPercent: number; // $B$8
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean; // $L$10 (не используется в расчете, но может понадобиться)
  coefficients: BankCoefficients;
}

export const clientContribution = (params: clientContribution): number => {
  const {
    objectCost,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    ownFunds,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    coefficients,
  } = params;

  const limit = variables.familyMortgageLimit || 6000000;
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const cafsummCred = 1 - userDownPaymentPercent / 100;

  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  let summCredit: number;
  let isWithinLimit: boolean;
  let clientContribution: number;

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  }

  if (isWithinLimit) {
    clientContribution = downPaymentAmount - ownFunds;
  } else {
    clientContribution = 0;
  }

  return Math.ceil(clientContribution);
};
