import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateFamilyDownPayment } from "./family/calculateFamilyDownPayment";
import { calculateStandardDownPayment } from "./standard/calculateStandardDownPayment";

// src/hooks/payment/downPayment/calculateDownPaymentAmount.ts
interface DownPaymentAmountParams {
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  remainingAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateDownPaymentAmount = (
  params: DownPaymentAmountParams,
): number => {
  const {
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
  } = params;

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  if (bankOffer.type === "family") {
    return calculateFamilyDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      bankOffer,
      remainingAmount,
      noSubsidyInflate,
    });
  }
  return calculateStandardDownPayment({
    contractAmount,
    downPayment,
    manualDownPayment,
    isSpecialMortgageMode,
    userDownPaymentPercent,
    objectCost,
    bankOffer,
  });
};

// ============================================================
// СТАНДАРТНЫЙ РАСЧЕТ (full, short)
// ============================================================
