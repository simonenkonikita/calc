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
}

export const calculateOwnFunds = (params: CalculateOwnFundsParams): number => {
  const {
    downPayment,
    downPaymentAmount,
    isSpecialMortgageMode,
    objectCost,
    remainingAmount,
    contractAmount,
    userDownPaymentPercent,
    offer,
    variables,
    coefficients,
  } = params;

  const programType = offer.programEntity?.type || "base";
  const isFamilyOrIt = programType === "family" || programType === "it";

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
