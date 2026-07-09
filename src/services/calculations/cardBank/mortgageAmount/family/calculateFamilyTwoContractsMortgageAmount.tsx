import {
  BankCoefficients,
  BankOffer,
  MortgageAmountResult,
  Variables,
} from "../../../../../utils/types";

interface calculateFamilyTwoContractsMortgageAmount {
  objectCost: number; // $B$7
  contractAmount: number; // C32
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number; // D32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
}

export const calculateFamilyTwoContractsMortgageAmount = (
  params: calculateFamilyTwoContractsMortgageAmount,
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
    coefficients,
  } = params;

  const limit = variables.familyMortgageLimit || 6000000;
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;

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
    if (mortgageAmount < limit) {
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
    if (mortgageAmount < limit) {
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
