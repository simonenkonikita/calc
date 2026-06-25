import { BankOffer, Variables } from "../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateFamilyContractAmount } from "./addContractAmount/Family/calculateFamilyContractAmount";
import { calculateStandardContractAmount } from "./addContractAmount/Standard/calculateStandardContractAmount";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  applyMinDownPayment: boolean,
): number => {
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  // ============================================================
  // 1. СЕМЕЙНАЯ ИПОТЕКА
  // ============================================================
  if (bankOffer.type === "family") {
    return calculateFamilyContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      applyMinDownPayment,
      coefficients,
    );
  }

  // ============================================================
  // 2. ИТ ИПОТЕКА
  // ============================================================
  /*   if (bankOffer.type === "it") {
    return calculateItContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      noSubsidyInflate,
      mortgageWithoutDownPayment,
      applyMinDownPayment,
      coefficients,
    );
  }
 */
  // ============================================================
  // 3. СТАНДАРТНЫЙ РАСЧЕТ (full, short)
  // ============================================================
  return calculateStandardContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    applyMinDownPayment,
    coefficients,
  );
};
