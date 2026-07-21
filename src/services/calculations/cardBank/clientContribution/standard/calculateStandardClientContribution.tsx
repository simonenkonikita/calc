import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../../utils/types";

interface clientContribution {
  objectCost: number; // $B$7
  downPaymentAmount: number; // D32 (сумма ПВ)
  ownFunds: number; // E32 (собственные средства)
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10 (не используется в расчете, но может понадобиться)
  coefficients: BankCoefficients;
}

export const clientContribution = (params: clientContribution): number => {
  const {
    objectCost,
    downPaymentAmount,
    ownFunds,
    userDownPaymentPercent,
    bankOffer,
    variables,
    coefficients,
  } = params;

  const limit = variables.familyMortgageLimit || 6000000;
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;

  const minPVPercent = coefficients.requiredCoeffWithMinPV; // Сбербанк!J16

  const summCredit =
    (objectCost / minPVPercent) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= maxLimit;

  let clientContribution: number;

  if (isWithinLimit) {
    clientContribution = downPaymentAmount - ownFunds;
  } else {
    clientContribution = 0;
  }

  return Math.ceil(clientContribution);
};
