// src/hooks/calculations/bankProgram/steps/calculateOwnFunds.ts

import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../utils/types";
import { ownFunds } from "./standard/ownFunds";

interface CalculateOwnFundsParams {
  objectCost: number;
  downPayment: number;
  remainingAmount: number;
  contractAmount: number;
  downPaymentAmount: number;
  userDownPaymentPercent: number;
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
  isFamilyOrIt: boolean;
}

export const calculateOwnFunds = (params: CalculateOwnFundsParams): number => {
  const {
    downPayment,
    downPaymentAmount,
    isSpecialMortgageMode,
    isFamilyOrIt,
    objectCost,
    remainingAmount,
    contractAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    coefficients,
  } = params;

  if (isFamilyOrIt) {
    return ownFunds({
      objectCost,
      downPayment,
      remainingAmount,
      contractAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      isSpecialMortgageMode,
      coefficients,
    });
  }

  return isSpecialMortgageMode ? downPayment : downPaymentAmount;
};
