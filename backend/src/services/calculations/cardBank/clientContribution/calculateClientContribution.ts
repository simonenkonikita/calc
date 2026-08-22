// src/hooks/calculations/bankProgram/steps/calculateClientContribution.ts

import { Offer } from "../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../types/types";
import { clientContribution } from "./standard/calculateStandardClientContribution";

interface CalculateClientContributionParams {
  objectCost: number;
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number;
  ownFunds: number;
  userDownPaymentPercent: number;
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
  isFamilyOrIt: boolean;
}

export const calculateClientContribution = (
  params: CalculateClientContributionParams,
): number => {
  const {
    downPayment,
    remainingAmount,
    downPaymentAmount,
    ownFunds,
    isSpecialMortgageMode,
    isFamilyOrIt,
    objectCost,
    userDownPaymentPercent,
    offer,
    variables,
    coefficients,
  } = params;

  if (isFamilyOrIt) {
    return clientContribution({
      objectCost,
      downPayment,
      remainingAmount,
      downPaymentAmount,
      ownFunds,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
      coefficients,
    });
  }

  return downPaymentAmount - ownFunds;
};
