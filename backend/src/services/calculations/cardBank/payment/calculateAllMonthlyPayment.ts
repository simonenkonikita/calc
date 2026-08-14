// backend/src/services/calculations/bankProgram/steps/payment/calculateAllMonthlyPayment.ts

import { Offer } from "../../../../entities/Offer";
import { TranchePaymentsResult } from "../../../../types/types";
import { calculateMonthlyPayment } from "./calculateMonthlyPayment";
import { calculateTwoContractsMonthlyPayment } from "./family/calculateTwoContractsMonthlyPayment";
import { calculateSubsidyPayments } from "./subsidy/calculateSubsidyPayments";
import { calculateTranchePayments } from "./tranche/calculateTranchePayments";

type SubsidyCalculationMethod = "standard" | "onlyPercent";

interface CalculateAllMonthlyPaymentParams {
  offer: Offer;
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

// 🔥 Функция для безопасного получения метода
const getSubsidyMethod = (offer: Offer): SubsidyCalculationMethod => {
  const method = offer.subsidyCalculationMethod;
  if (method === "onlyPercent") {
    return "onlyPercent";
  }
  return "standard"; // default
};

export const calculateAllMonthlyPayment = (
  params: CalculateAllMonthlyPaymentParams,
): CalculateAllMonthlyPaymentResult => {
  const {
    offer,
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
  const method = getSubsidyMethod(offer); // ← теперь правильный тип

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

  // 1. КОРОТКАЯ СУБСИДИЯ
  if (isShortSubsidy && offer.shortRate !== null && offer.shortRate !== undefined) {
    const shortRate = offer.shortRate;
    const durationMonths = offer.durationMonths ?? 12;
    
    const result = calculateSubsidyPayments(
      mortgageAmount,
      shortRate,
      actualRate,
      loanTermMonths,
      durationMonths,
      method, // ← теперь правильный тип "standard" | "onlyPercent"
    );
    monthlyPayment = result.monthlyPaymentSubsidy;
    monthlyPaymentAfter = result.monthlyPaymentAfter;
  } 
  // 2. ДВА ДОГОВОРА
  else if (isTwoContracts && offer.twoRate !== null && offer.twoRate !== undefined) {
    const twoRate = offer.twoRate;
    
    const result = calculateTwoContractsMonthlyPayment(
      mortgageAmount,
      twoRate,
      actualRate,
      loanTermMonths,
    );
    firstContractPayment = result.firstContractPayment;
    secondContractPayment = result.secondContractPayment;
    totalMonthlyPayment = result.totalMonthlyPayment;
    monthlyPayment = totalMonthlyPayment;
  } 
  // 3. ТРАНШЕВАЯ ИПОТЕКА
  else if (isTranche) {
    const trancheResult = calculateTranchePayments(
      actualRate,
      offer,
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
  // 4. СТАНДАРТНАЯ ИПОТЕКА
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