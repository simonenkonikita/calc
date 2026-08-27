// backend/src/services/calculations/bankProgram/steps/calculateContractAmount.ts

import { Offer } from "../../../../entities/Offer";
import {
  Variables,
  BankCoefficients,
  ContractAmountResult,
} from "../../../../types/types";
import { calculateFamilyContractAmount } from "./family/calculateFamilyContractAmount";
import { calculateFamilyExcessLimitContractAmount } from "./family/calculateFamilyExcessLimitContractAmount";
import { calculateFamilyTwoContractAmount } from "./family/calculateFamilyTwoContractAmount";
import { calculateStandardContractAmount } from "./standard/calculateStandardContractAmount";

export const calculateContractAmount = (
  offer: Offer,
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
): ContractAmountResult => {
  const programType = offer.programEntity?.type || "base";
  const isFamilyOrIt = programType === "family" || programType === "it";
  const isTwoContracts = isFamilyOrIt && offer.isTwoContracts === true;
  const isExcessLimit = isFamilyOrIt && offer.excessLimit === true;

  if (isTwoContracts) {
    return calculateFamilyTwoContractAmount(
      offer,
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  if (isExcessLimit) {
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

  if (isFamilyOrIt) {
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
