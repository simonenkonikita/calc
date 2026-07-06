import {
  BankOffer,
  MortgageAmountResult,
  Variables,
} from "../../../../../utils/types";
import { calculateBankCoefficients } from "../../../сoefficients/calculateBankCoefficients";

interface calculateFamilyMortgageAmount {
  objectCost: number; // $B$7
  contractAmount: number; // C32
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number; // D32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
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
    bankOffer,
    variables,
    isSpecialMortgageMode,
  } = params;

  const coefficients = calculateBankCoefficients(
    variables,
    objectCost,
    bankOffer,
    userDownPaymentPercent,
  );

  const limit = variables.familyMortgageLimit || 6000000;

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
