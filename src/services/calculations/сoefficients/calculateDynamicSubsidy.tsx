// src/hooks/calculations/bankProgram/coefficients/calculateDynamicSubsidy.ts

import { BankCoefficients, BankOffer, Variables } from "../../../utils/types";
import { calculateContractAmountWithSubsidy } from "./calculateContractAmountWithSubsidy";
import { getDynamicSubsidy } from "./getDynamicSubsidy";

interface CalculateDynamicSubsidyParams {
  bankOffer: BankOffer;
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
    bankOffer,
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

  let subsidyPercent = bankOffer.subsidyPercent || 0;
  let сontractAmount = objectCost;
  let initialMortgage = remainingAmount;

  let iterations = 0;
  const MAX_ITERATIONS = 20;
  const CONVERGENCE_THRESHOLD = 1;

  if (isTwoContracts) {
    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const newSubsidy = getDynamicSubsidy(
        bankOffer,
        userDownPaymentPercent,
        initialMortgage - variables.familyMortgageLimit,
        loanTermYears,
      );

      if (newSubsidy === subsidyPercent && iterations > 1) {
        break;
      }

      if (newSubsidy !== undefined) {
        subsidyPercent = newSubsidy;
      }

      сontractAmount = calculateContractAmountWithSubsidy(
        objectCost,
        downPayment,
        remainingAmount,
        userDownPaymentPercent,
        manualDownPayment,
        bankOffer,
        variables,
        noSubsidyInflate,
        isSpecialMortgageMode,
        coefficients,
        subsidyPercent,
      );

      const downPaymentFromContract =
        сontractAmount * (userDownPaymentPercent / 100);

      const newMortgage = сontractAmount - downPaymentFromContract;

      if (Math.abs(newMortgage - initialMortgage) < CONVERGENCE_THRESHOLD) {
        initialMortgage = newMortgage;
        break;
      }

      initialMortgage = newMortgage;
    }
    return subsidyPercent;
  }

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const newSubsidy = getDynamicSubsidy(
      bankOffer,
      userDownPaymentPercent,
      initialMortgage,
      loanTermYears,
    );

    if (newSubsidy === subsidyPercent && iterations > 1) {
      break;
    }

    if (newSubsidy !== undefined) {
      subsidyPercent = newSubsidy;
    }

    const newContractAmount = calculateContractAmountWithSubsidy(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      manualDownPayment,
      bankOffer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
      subsidyPercent,
    );

    const downPaymentFromContract =
      newContractAmount * (userDownPaymentPercent / 100);

    const newMortgage = newContractAmount - downPaymentFromContract;

    if (Math.abs(newMortgage - initialMortgage) < CONVERGENCE_THRESHOLD) {
      initialMortgage = newMortgage;
      break;
    }

    initialMortgage = newMortgage;
  }
  return subsidyPercent;
};
