// src/hooks/payment/downPayment/calculateStandardDownPayment.ts

import { MIN_DOWN_PAYMENT_PERCENT } from "../../../../utils/constants";
import { BankOffer } from "../../../../utils/types";

interface StandardDownPaymentParams {
  contractAmount: number;
  downPayment: number;
  manualDownPayment: number;
  isSpecialMortgageMode: boolean;
  userDownPaymentPercent: number;
  objectCost: number;
  bankOffer: BankOffer;
}

export const calculateStandardDownPayment = (
  params: StandardDownPaymentParams,
): number => {
  const {
    contractAmount,
    downPayment,
    manualDownPayment,
    isSpecialMortgageMode,
    userDownPaymentPercent,
    objectCost,
    bankOffer,
  } = params;

  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);
  const contractAmountMinPV = contractAmount * (bankOffer.minPVPercent / 100);

  let downPaymentAmount: number;

  if (isSpecialMortgageMode) {
    downPaymentAmount = contractAmountMinPV;
  } else if (manualDownPayment > 0) {
    if (manualDownPayment > objectCost) {
      downPaymentAmount = contractAmountMinPV;
    } else if (manualDownPayment < contractAmountMinPV) {
      downPaymentAmount = contractAmountMinPV;
    } else {
      downPaymentAmount = manualDownPayment;
    }
  } else if (userDownPaymentPercent > MIN_DOWN_PAYMENT_PERCENT) {
    downPaymentAmount = downPaymentFromContract;
  } else if (downPayment >= contractAmountMinPV) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = contractAmountMinPV;
  }

  return Math.ceil(downPaymentAmount);
};
