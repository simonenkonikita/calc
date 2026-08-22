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
  objectCost: number;
  contractAmount: number;
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number;
  userDownPaymentPercent: number;
  offer: Offer;
  variables: Variables;
  isFamilyOrIt: boolean;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
}

export const calculateMortgageAmount = (
  params: CalculateMortgageAmountParams,
): MortgageAmountResult => {
  const {
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
  } = params;

  const programType = offer.programEntity?.type || "base";

  if (programType === "tranche" || offer.isTranche === true) {
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

  if (programType === "family" && offer.isTwoContracts === true) {
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

  if (programType === "family" && offer.excessLimit === true) {
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

  if (programType === "family") {
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

  /*  if (bankOffer.type === "it") {
    const familyMortgageAmount = calculateFamilyMortgageAmount({
      objectCost,
      contractAmount,
      downPayment,
      remainingAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      isSpecialMortgageMode,
    });
    return familyMortgageAmount;
  } */

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
