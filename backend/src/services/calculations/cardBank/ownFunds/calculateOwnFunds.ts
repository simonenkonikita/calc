import { Offer } from "../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../types/types";
import { ownFunds } from "./standard/ownFunds";

interface CalculateOwnFundsParams {
  objectCost: number;
  downPayment: number;
  remainingAmount: number;
  contractAmount: number;
  downPaymentAmount: number;
  userDownPaymentPercent: number;
  offer: Offer;
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
    offer,
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
      offer,
      variables,
      isSpecialMortgageMode,
      coefficients,
    });
  }

  return isSpecialMortgageMode ? downPayment : downPaymentAmount;
};
