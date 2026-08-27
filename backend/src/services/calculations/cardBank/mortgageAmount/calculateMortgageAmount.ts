import { Offer } from "../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
  MortgageAmountResult,
} from "../../../../types/types";
import { calculateFamilyExcessLimitMortgageAmount } from "./family/calculateFamilyExcessLimitMortgageAmount";
import { calculateFamilyMortgageAmount } from "./family/calculateFamilyMortgageAmount";
import { calculateFamilyTwoContractsMortgageAmount } from "./family/calculateFamilyTwoContractsMortgageAmount";
import { calculateStandartMortgageAmount } from "./standard/calculateStandartMortgageAmount";
import { calculateTrancheMortgageAmount } from "./tranche/calculateTrancheMortgageAmount";

interface CalculateMortgageAmountParams {
  offer: Offer;
  objectCost: number;
  contractAmount: number;
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number;
  userDownPaymentPercent: number;
  variables: Variables;
  coefficients: BankCoefficients;
  isSpecialMortgageMode: boolean;
}

export const calculateMortgageAmount = (
  params: CalculateMortgageAmountParams,
): MortgageAmountResult => {
  const {
    offer,
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    variables,
    coefficients,
    isSpecialMortgageMode,
  } = params;

  const programType = offer.programEntity?.type || "base";
  const isFamilyOrIt = programType === "family" || programType === "it";
  const isTwoContracts = isFamilyOrIt && offer.isTwoContracts === true;
  const isExcessLimit = isFamilyOrIt && offer.excessLimit === true;
  const isTranche = programType === "tranche" && offer.isTranche === true;

  if (isTranche) {
    return calculateTrancheMortgageAmount({
      objectCost,
      contractAmount,
      downPayment,
      remainingAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
    });
  }

  if (isTwoContracts) {
    return calculateFamilyTwoContractsMortgageAmount({
      objectCost,
      contractAmount,
      downPayment,
      remainingAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
      coefficients,
    });
  }

  if (isExcessLimit) {
    return calculateFamilyExcessLimitMortgageAmount({
      objectCost,
      contractAmount,
      downPayment,
      remainingAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
      coefficients,
    });
  }

  if (isFamilyOrIt) {
    return calculateFamilyMortgageAmount({
      objectCost,
      contractAmount,
      downPayment,
      remainingAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
      coefficients,
    });
  }

  return calculateStandartMortgageAmount({
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
  });
};
