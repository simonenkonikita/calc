// src/hooks/calculations/bankProgram/steps/calculateMonthlyPayment.ts

import { BankOffer, TranchePaymentsResult } from "../../../../types/types";
import { calculateMonthlyPayment } from "./calculateMonthlyPayment";
import { calculateTwoContractsMonthlyPayment } from "./family/calculateTwoContractsMonthlyPayment";
import { calculateSubsidyPayments } from "./subsidy/calculateSubsidyPayments";
import { calculateTranchePayments } from "./tranche/calculateTranchePayments";

interface CalculateAllMonthlyPaymentParams {
  bankOffer: BankOffer;
  mortgageAmount: number;
  actualRate: number;
  loanTermYears: number;
  complexName: string;
  isShortSubsidy: boolean;
  isTwoContracts: boolean;
  isTranche: boolean;
  firstTrancheAmount?: number;
  secondTrancheAmount?: number;
}

interface CalculateAllMonthlyPaymentResult {
  monthlyPayment: number;
  monthlyPaymentAfter: number | null;
  firstContractPayment: number;
  secondContractPayment: number;
  totalMonthlyPayment: number;
  trancheSchedule: TranchePaymentsResult;
}

export const calculateAllMonthlyPayment = (
  params: CalculateAllMonthlyPaymentParams,
): CalculateAllMonthlyPaymentResult => {
  const {
    bankOffer,
    mortgageAmount,
    actualRate,
    loanTermYears,
    complexName,
    isShortSubsidy,
    isTwoContracts,
    isTranche,
    firstTrancheAmount = 0,
    secondTrancheAmount = 0,
  } = params;

  const loanTermMonths = loanTermYears * 12;
  const method = bankOffer.subsidyCalculationMethod || "standard";

  let monthlyPayment = 0;
  let monthlyPaymentAfter: number | null = null;
  let firstContractPayment = 0;
  let secondContractPayment = 0;
  let totalMonthlyPayment = 0;

  let trancheSchedule: TranchePaymentsResult = {
    firstTranchePayment: 0,
    secondTranchePayment: 0,
    monthlyPayment: 0,
  };

  // ============================================================
  // 1. КОРОТКАЯ СУБСИДИЯ
  // ============================================================
  if (isShortSubsidy && bankOffer.shortRate !== undefined) {
    const result = calculateSubsidyPayments(
      mortgageAmount,
      bankOffer.shortRate,
      actualRate,
      loanTermMonths,
      bankOffer.durationMonths || 12,
      method,
    );
    monthlyPayment = result.monthlyPaymentSubsidy;
    monthlyPaymentAfter = result.monthlyPaymentAfter;
  }

  // ============================================================
  // 2. ДВА ДОГОВОРА (СЕМЕЙНАЯ)
  // ============================================================
  else if (isTwoContracts && bankOffer.twoRate !== undefined) {
    const result = calculateTwoContractsMonthlyPayment(
      mortgageAmount,
      bankOffer.twoRate,
      actualRate, // 6% для первого договора
      loanTermMonths,
    );
    firstContractPayment = result.firstContractPayment;
    secondContractPayment = result.secondContractPayment;
    totalMonthlyPayment = result.totalMonthlyPayment;
    monthlyPayment = totalMonthlyPayment;
  }

  // ============================================================
  // 3. ТРАНШЕВАЯ ИПОТЕКА
  // ============================================================
  else if (isTranche) {
    const trancheResult = calculateTranchePayments(
      actualRate,
      bankOffer,
      firstTrancheAmount,
      secondTrancheAmount,
      mortgageAmount,
      loanTermMonths,
      complexName,
    );

    firstContractPayment = trancheResult.firstTranchePayment;
    secondContractPayment = trancheResult.secondTranchePayment;
    monthlyPayment = trancheResult.monthlyPayment;
    totalMonthlyPayment = trancheResult.monthlyPayment;

    trancheSchedule = {
      firstTranchePayment: trancheResult.firstTranchePayment,
      secondTranchePayment: trancheResult.secondTranchePayment,
      monthlyPayment: trancheResult.monthlyPayment,
      monthsUntilSecondTranche: trancheResult.monthsUntilSecondTranche,
      trancheSecondDate: trancheResult.trancheSecondDate,
    };
  }

  // ============================================================
  // 4. СТАНДАРТНАЯ ИПОТЕКА
  // ============================================================
  else {
    monthlyPayment = calculateMonthlyPayment(
      mortgageAmount,
      actualRate,
      loanTermMonths,
    );
  }

  return {
    monthlyPayment,
    monthlyPaymentAfter,
    firstContractPayment,
    secondContractPayment,
    totalMonthlyPayment,
    trancheSchedule,
  };
};
