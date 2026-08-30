import { Offer } from "../../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
  MortgageAmountResult,
} from "../../../../../types/types";

interface calculateFamilyExcessLimitMortgageAmount {
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

export const calculateFamilyExcessLimitMortgageAmount = (
  params: calculateFamilyExcessLimitMortgageAmount,
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
  // eslint-disable-next-line no-useless-assignment
  let isLimitExceeded: boolean = false;

  if (isSpecialMortgageMode) {
    if (mortgageAmount <= limit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    } else if (isWithinLimit) {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = false;
    } else {
      mortgageAmount = contractAmount - downPaymentAmount;
      isLimitExceeded = true;
    }
  } else {
    if (mortgageAmount <= limit) {
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
    isLimitExceeded,
  };
};
