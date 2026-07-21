// src/hooks/calculations/bankProgram/steps/calculateClientContribution.ts

import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../utils/types";
import { clientContribution } from "./standard/calculateStandardClientContribution";

interface CalculateClientContributionParams {
  objectCost: number;
  downPaymentAmount: number;
  ownFunds: number;
  userDownPaymentPercent: number;
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
  isFamilyOrIt: boolean;
}

export const calculateClientContribution = (
  params: CalculateClientContributionParams,
): number => {
  const {
    downPaymentAmount,
    ownFunds,
    isSpecialMortgageMode,
    isFamilyOrIt,
    objectCost,
    userDownPaymentPercent,
    bankOffer,
    variables,
    coefficients,
  } = params;

  if (isFamilyOrIt) {
    return clientContribution({
      objectCost,
      downPaymentAmount,
      ownFunds,
      userDownPaymentPercent,
      bankOffer,
      variables,
      mortgageWithoutDownPayment: isSpecialMortgageMode,
      coefficients,
    });
  }

  return downPaymentAmount - ownFunds;
};
