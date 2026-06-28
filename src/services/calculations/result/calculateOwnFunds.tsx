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
    contractAmount,
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

  const limit = variables.familyMortgageLimit;
  const subsidyPercent = bankOffer.subsidyPercent;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);

  const contractAmountMinPV = contractAmount * (bankOffer.minPVPercent / 100);

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
