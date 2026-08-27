import { Offer } from "../../../../../entities/Offer";
import {
  BankCoefficients,
  BankOffer,
  MortgageAmountResult,
  Variables,
} from "../../../../../types/types";

interface calculateFamilyMortgageAmount {
  objectCost: number; // $B$7
  contractAmount: number; // C32
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number; // D32
  userDownPaymentPercent: number; // $B$8
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
}

export const calculateFamilyMortgageAmount = (
  params: calculateFamilyMortgageAmount,
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

  const bankName = offer.bank?.name || "";

  const isIt = offer.programEntity?.type === "it";

  const limit = isIt
    ? variables.minExcessAmountsIt?.[bankName] || 9000000
    : variables.minExcessAmountsFamily?.[bankName] || 6000000;

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
    isWithinLimit = summCredit <= limit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= limit;
  }

  let mortgageAmount: number;
  // eslint-disable-next-line no-useless-assignment
  let isLimitExceeded: boolean = false;

  if (isSpecialMortgageMode) {
    if (isWithinLimit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = false;
    } else {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    }
  } else {
    if (isWithinLimit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = false;
    } else {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = false;
    }
  }
  return {
    mortgageAmount: Math.ceil(mortgageAmount),
    isLimitExceeded,
  };
};
