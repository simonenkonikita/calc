// src/hooks/calculations/bankProgram/steps/calculateDeveloperAccount.ts

import { Offer } from "../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../types/types";
import { developerAccount } from "./developerAccount.ts/developerAccount";

interface CalculateDeveloperAccountParams {
  objectCost: number;
  ownFunds: number;
  downPayment: number;
  remainingAmount: number;
  mortgageAmount: number;
  subsidyAmount: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  downPaymentAmount: number;
  noSubsidyInflate: boolean;
  coefficients: BankCoefficients;
  isFamilyOrIt: boolean;
}

export const calculateDeveloperAccount = (
  params: CalculateDeveloperAccountParams,
): number => {
  const {
    objectCost,
    ownFunds,
    downPayment,
    remainingAmount,
    mortgageAmount,
    subsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    downPaymentAmount,
    noSubsidyInflate,
    coefficients,
    isFamilyOrIt,
  } = params;

  // ============================================================
  // СЕМЕЙНАЯ/ИТ — сложная формула с лимитами
  // ============================================================
  if (isFamilyOrIt) {
    return developerAccount({
      objectCost,
      ownFunds,
      downPayment,
      remainingAmount,
      mortgageAmount,
      subsidyAmount,
      contractAmount,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
      downPaymentAmount,
      noSubsidyInflate,
      coefficients,
    });
  }

  // ============================================================
  // ОБЫЧНАЯ ИПОТЕКА (full, short) — простая формула
  // ============================================================
  if (isSpecialMortgageMode) {
    return ownFunds + mortgageAmount - subsidyAmount;
  }

  return contractAmount - subsidyAmount;
};
