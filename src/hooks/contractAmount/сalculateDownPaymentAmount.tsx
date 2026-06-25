import { BankOffer, Variables } from "../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateFamilyDownPayment } from "./addContractAmount/Family/calculateFamilyDownPayment";
import { calculateStandardDownPayment } from "./addContractAmount/Standard/calculateStandardDownPayment";

// src/hooks/payment/downPayment/calculateDownPaymentAmount.ts
interface DownPaymentAmountParams {
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean;
}

/**
 * Расчет суммы ПВ в зависимости от типа программы
 */
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
    mortgageWithoutDownPayment,
  } = params;

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  const contractAmountMinPV = contractAmount * (bankOffer.minPVPercent / 100);
  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);

  const isFamilyOrIt = bankOffer.type === "family" || bankOffer.type === "it";

  if (isFamilyOrIt) {
    // ============================================================
    // СЕМЕЙНАЯ ИЛИ ИТ ИПОТЕКА
    // ============================================================
    const limit =
      bankOffer.type === "family"
        ? variables.familyMortgageLimit
        : variables.itMortgageLimit;

    const minPVPercent = bankOffer.minPVPercent;
    const summCredit =
      (objectCost / coefficients.requiredCoeffWithMinPV) *
      (1 - userDownPaymentPercent / 100);
    const isWithinLimit = summCredit <= limit;

    // ============================================================
    // 1. СЕМЕЙНАЯ ИПОТЕКА
    // ============================================================
    if (bankOffer.type === "family") {
      return calculateFamilyDownPayment({
        objectCost,
        downPayment,
        contractAmount,
        userDownPaymentPercent,
        manualDownPayment,
        mortgageWithoutDownPayment,
        contractAmountMinPV,
        downPaymentFromContract,
        minPVPercent,
        limit,
        isWithinLimit,
      });
    }

    // ============================================================
    // 2. ИТ ИПОТЕКА
    // ============================================================
    /*  if (bankOffer.type === "it") {
      return calculateItDownPayment({
        objectCost,
        downPayment,
        contractAmount,
        userDownPaymentPercent,
        manualDownPayment,
        mortgageWithoutDownPayment,
        contractAmountMinPV,
        downPaymentFromContract,
        minPVPercent,
        limit,
        isWithinLimit,
      });
    } */
  }

  // ============================================================
  // СТАНДАРТНЫЙ РАСЧЕТ (full, short)
  // ============================================================
  return calculateStandardDownPayment({
    contractAmount,
    contractAmountMinPV,
    downPaymentFromContract,
    downPayment,
    manualDownPayment,
    mortgageWithoutDownPayment,
    userDownPaymentPercent,
  });
};
