import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateDeveloperAccountParams {
  objectCost: number; // $B$7 / E32
  ownFunds: number; // $B$13 / J32
  downPayment: number;
  remainingAmount: number;
  mortgageAmount: number; // $B$14 / D32
  subsidyAmount: number; // C32
  contractAmount: number; // I32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean; // $L$10
  downPaymentAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateDeveloperAccount = (
  params: CalculateDeveloperAccountParams,
): number => {
  const {
    objectCost,
    ownFunds,
    downPayment,
    remainingAmount,
    mortgageAmount,
    subsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    downPaymentAmount,
  } = params;

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );
  const limit = variables.familyMortgageLimit;
  const subsidyPercent = bankOffer.subsidyPercent;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const summCreditLargePV =
    remainingAmount * coefficients.requiredCoeffWithLargePV + downPayment;

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
      console.log(contractAmount, subsidyAmount);
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  }
  return Math.ceil(developerAccount);
};
