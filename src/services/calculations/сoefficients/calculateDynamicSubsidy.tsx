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

  // ============================================================
  // НАЧАЛЬНАЯ ИПОТЕКА
  // ============================================================
  let initialMortgage = objectCost * ((100 - userDownPaymentPercent) / 100);

  // Для 2 договоров - используем сумму второго договора
  if (isTwoContracts) {
    const firstContractLimit = 6000000;
    const secondContract = Math.max(0, initialMortgage - firstContractLimit);
    initialMortgage = secondContract > 0 ? secondContract : initialMortgage;
  }

  let currentMortgage = initialMortgage;
  let iterations = 0;
  const MAX_ITERATIONS = 20;
  const CONVERGENCE_THRESHOLD = 1;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const newSubsidy = getDynamicSubsidy(
      bankOffer,
      userDownPaymentPercent,
      currentMortgage,
      loanTermYears,
    );

    if (newSubsidy === subsidyPercent && iterations > 1) {
      break;
    }

    if (newSubsidy !== undefined) {
      subsidyPercent = newSubsidy;
    }

    // Пересчитываем сумму договора с новой субсидией
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

    // Для 2 договоров - обновляем сумму второго договора
    let newSecondContract = newMortgage;

    if (isTwoContracts) {
      newSecondContract = newMortgage - variables.familyMortgageLimit;
    }

    // Для сравнения используем сумму второго договора (если это 2 договора)
    const mortgageForComparison = isTwoContracts
      ? newSecondContract
      : newMortgage;

    if (
      Math.abs(mortgageForComparison - currentMortgage) < CONVERGENCE_THRESHOLD
    ) {
      currentMortgage = mortgageForComparison;
      break;
    }

    currentMortgage = mortgageForComparison;
  }

  return subsidyPercent;
};
