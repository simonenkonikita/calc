import { BankOffer, Variables } from "../../../../../utils/types";
import { calculateBankCoefficients } from "../../../сoefficients/calculateBankCoefficients";

interface CalculateClientContributionParams {
  objectCost: number; // $B$7
  downPaymentAmount: number; // D32 (сумма ПВ)
  ownFunds: number; // E32 (собственные средства)
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10 (не используется в расчете, но может понадобиться)
}

export const calculateClientContribution = (
  params: CalculateClientContributionParams,
): number => {
  const {
    objectCost,
    downPaymentAmount,
    ownFunds,
    userDownPaymentPercent,
    bankOffer,
    variables,
  } = params;

  const coefficients = calculateBankCoefficients(
    variables,
    objectCost,
    bankOffer,
    userDownPaymentPercent,
  );

  const limit = bankOffer.excessLimit
    ? variables.maxFamilyMortgageSum || 15000000
    : variables.familyMortgageLimit || 6000000;

  const minPVPercent = coefficients.requiredCoeffWithMinPV; // Сбербанк!J16

  const summCredit =
    (objectCost / minPVPercent) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;

  let clientContribution: number;

  if (isWithinLimit) {
    clientContribution = downPaymentAmount - ownFunds;
  } else {
    clientContribution = 0;
  }

  return Math.ceil(clientContribution);
};
