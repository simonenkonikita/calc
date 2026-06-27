import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../../сoefficients/calculateBankCoefficients";

interface CalculateDeveloperAccountParams {
  objectCost: number; // $B$7 / E32
  ownFunds: number; // $B$13 / J32
  mortgageAmount: number; // $B$14 / D32
  subsidyAmount: number; // C32
  contractAmount: number; // I32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10
  downPaymentAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateDeveloperAccount = (
  params: CalculateDeveloperAccountParams,
): number => {
  const {
    objectCost,
    ownFunds,
    mortgageAmount,
    subsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    mortgageWithoutDownPayment,
    downPaymentAmount,
  } = params;

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  const limit = variables.familyMortgageLimit;
  const minPVPercent = coefficients.requiredCoeffWithMinPV;

  const summCredit =
    (objectCost / minPVPercent) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;

  let developerAccount: number;

  if (isWithinLimit) {
    if (mortgageWithoutDownPayment) {
      developerAccount = ownFunds + mortgageAmount - subsidyAmount;
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  } else {
    if (mortgageWithoutDownPayment) {
      developerAccount = ownFunds + mortgageAmount - subsidyAmount;
    } else {
      developerAccount = downPaymentAmount + mortgageAmount - subsidyAmount;
    }
  }
  return Math.ceil(developerAccount);
};
