// src/hooks/payment/downPayment/calculateDownPaymentAmount.ts

import { BankOffer, Variables } from "../../../utils/types";
import { calculateFamilyItDownPayment } from "./calculateFamilyDownPayment";
import { calculateStandardDownPayment } from "./calculateStandardDownPayment";

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
    const minPVWithSubsidy =
      (objectCost / (minPVPercent / 100)) * (1 - userDownPaymentPercent / 100);
    const isWithinLimit = minPVWithSubsidy <= limit;

    return calculateFamilyItDownPayment({
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
  } else {
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
  }
};
