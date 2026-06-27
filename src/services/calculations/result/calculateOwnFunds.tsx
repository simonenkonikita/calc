import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateOwnFundsParams {
  objectCost: number; // $B$7
  downPayment: number; // $B$13 / J32 (введенный ПВ)
  downPaymentAmount: number; // D32 (рассчитанная сумма ПВ)
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10
}
export const calculateOwnFunds = (params: CalculateOwnFundsParams): number => {
  const {
    objectCost,
    downPayment,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    mortgageWithoutDownPayment,
  } = params;

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  const limit = variables.familyMortgageLimit;
  const minPVPercent = coefficients.requiredCoeffWithMinPV; // Сбербанк!J16

  const summCredit =
    (objectCost / minPVPercent) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;

  let ownFunds: number;

  if (isWithinLimit) {
    if (mortgageWithoutDownPayment) {
      ownFunds = downPayment;
    } else {
      ownFunds = downPaymentAmount;
    }
  } else {
    ownFunds = downPaymentAmount;
    console.log(`"ownFunds"${ownFunds}`);
  }

  return Math.ceil(ownFunds);
};
