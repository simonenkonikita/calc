// backend/src/services/calculations/coefficients/calculateDynamicSubsidy.ts

import { Offer } from "../../../entities/Offer";
import { BankCoefficients, Variables } from "../../../types/types";
import { getDynamicSubsidy } from "./getDynamicSubsidy";
import { calculateContractAmountWithSubsidy } from "./calculateContractAmountWithSubsidy";

interface CalculateDynamicSubsidyParams {
  offer: Offer;
  userDownPaymentPercent: number;
  objectCost: number;
  downPayment: number;
  remainingAmount: number;
  manualDownPayment: number;
  variables: Variables;
  noSubsidyInflate: boolean;
  isSpecialMortgageMode: boolean;
  coefficients: BankCoefficients;
  loanTermYears: number;
  isTwoContracts?: boolean;
}

export const calculateDynamicSubsidy = (
  params: CalculateDynamicSubsidyParams,
): number => {
  const {
    offer,
    userDownPaymentPercent,
    objectCost,
    downPayment,
    remainingAmount,
    manualDownPayment,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    coefficients,
    loanTermYears,
    isTwoContracts = false,
  } = params;

  let subsidyPercent = offer.subsidyPercent || 0;
  let contractAmount = objectCost;
  let initialMortgage = remainingAmount;

  let iterations = 0;
  const MAX_ITERATIONS = 20;
  const CONVERGENCE_THRESHOLD = 1;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    let newSubsidy: number;
    if (isTwoContracts) {
      newSubsidy = getDynamicSubsidy(
        offer.dynamicSubsidies,
        userDownPaymentPercent,
        initialMortgage - variables.familyMortgageLimit,
        loanTermYears,
      );
    } else {
      newSubsidy = getDynamicSubsidy(
        offer.dynamicSubsidies,
        userDownPaymentPercent,
        initialMortgage,
        loanTermYears,
      );
    }

    if (newSubsidy === subsidyPercent && iterations > 1) {
      break;
    }

    if (newSubsidy !== undefined) {
      subsidyPercent = newSubsidy;
    }

    contractAmount = calculateContractAmountWithSubsidy(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      manualDownPayment,
      offer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
      subsidyPercent,
    );

    const downPaymentFromContract =
      contractAmount * (userDownPaymentPercent / 100);
    const newMortgage = contractAmount - downPaymentFromContract;

    if (Math.abs(newMortgage - initialMortgage) < CONVERGENCE_THRESHOLD) {
      initialMortgage = newMortgage;
      break;
    }

    initialMortgage = newMortgage;
  }

  return subsidyPercent;
};
