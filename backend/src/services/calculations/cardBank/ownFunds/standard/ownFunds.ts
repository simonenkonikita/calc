import { Offer } from "../../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../../types/types";

interface ownFundsParams {
  objectCost: number; // $B$7
  downPayment: number; // $B$13 / J32 (введенный ПВ)
  remainingAmount: number;
  contractAmount: number;
  downPaymentAmount: number; // D32 (рассчитанная сумма ПВ)
  userDownPaymentPercent: number; // $B$8
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean; // $L$10
  coefficients: BankCoefficients;
}

export const ownFunds = (params: ownFundsParams): number => {
  const {
    objectCost,
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

  const limit = isIt
    ? variables.itMortgageLimit || 9000000
    : variables.familyMortgageLimit || 6000000;

  const maxLimit = isIt
    ? variables.maxItMortgageSum || 18000000
    : variables.maxFamilyMortgageSum || 15000000;

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

  let ownFunds: number;

  if (isSpecialMortgageMode) {
    if (isWithinLimit) {
      ownFunds = downPayment;
    } else {
      ownFunds = downPaymentAmount;
    }
  } else {
    ownFunds = downPaymentAmount;
  }

  return Math.ceil(ownFunds);
};
