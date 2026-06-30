import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateMortgageAmountParams {
  objectCost: number; // $B$7
  contractAmount: number; // C32
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number; // D32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isFamilyOrIt: boolean;
  isSpecialMortgageMode: boolean;
}

export const calculateMortgageAmount = (
  params: CalculateMortgageAmountParams,
): number => {
  const {
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isFamilyOrIt,
    isSpecialMortgageMode,
  } = params;

  if (!isFamilyOrIt) {
    return contractAmount - downPaymentAmount;
  }

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  const limit = bankOffer.excessLimit
    ? variables.maxFamilyMortgageSum || 15000000 // Если excessLimit true → 15 млн
    : variables.familyMortgageLimit || 6000000; // Иначе → 6 млн

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

  if (isSpecialMortgageMode) {
    if (isWithinLimit) {
      mortgageAmount = contractAmount - downPaymentAmount;
    } else {
      mortgageAmount = limit;
    }
  }
  return contractAmount - downPaymentAmount;
};
