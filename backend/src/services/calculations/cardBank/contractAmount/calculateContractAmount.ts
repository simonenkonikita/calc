// backend/src/services/calculations/bankProgram/steps/calculateContractAmount.ts

import { Offer } from "../../../../entities/Offer";
import { Variables, BankCoefficients, ContractAmountResult } from "../../../../types/types";
import { calculateFamilyContractAmount } from "./family/calculateFamilyContractAmount";
import { calculateFamilyExcessLimitContractAmount } from "./family/calculateFamilyExcessLimitContractAmount";
import { calculateFamilyTwoContractAmount } from "./family/calculateFamilyTwoContractAmount";
import { calculateStandardContractAmount } from "./standard/calculateStandardContractAmount";


export const calculateContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  offer: Offer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
): ContractAmountResult => {
  const programType = offer.programEntity?.type || 'base';

  if (programType === "family" && offer.isTwoContracts === true) {
    return calculateFamilyTwoContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      offer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  if (programType === "family" && offer.excessLimit === true) {
    return calculateFamilyExcessLimitContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      offer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  if (programType === "family") {
    return calculateFamilyContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      offer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  return calculateStandardContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    offer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    coefficients,
  );
};