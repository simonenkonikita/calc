import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateOwnFundsParams {
  objectCost: number; // $B$7
  downPayment: number; // $B$13 / J32 (введенный ПВ)
  remainingAmount: number;
  contractAmount: number;
  downPaymentAmount: number; // D32 (рассчитанная сумма ПВ)
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean; // $L$10
}
export const calculateOwnFunds = (params: CalculateOwnFundsParams): number => {
  const {
    objectCost,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isSpecialMortgageMode,
  } = params;

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
