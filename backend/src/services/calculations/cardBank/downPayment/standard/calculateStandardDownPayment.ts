// src/hooks/payment/downPayment/calculateStandardDownPayment.ts
import { Offer } from "../../../../../entities/Offer";

interface StandardDownPaymentParams {
  contractAmount: number;
  downPayment: number;
  manualDownPayment: number;
  isSpecialMortgageMode: boolean;
  userDownPaymentPercent: number;
  objectCost: number;
  offer: Offer;
  minDownPaymentPercent: number;
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
    offer,
    minDownPaymentPercent,
  } = params;

  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);
  const contractAmountMinPV = contractAmount * (offer.minPVPercent / 100);

  let downPaymentAmount: number;

  if (isSpecialMortgageMode) {
    if (manualDownPayment >= objectCost) {
      downPaymentAmount = contractAmountMinPV;
    } else {
      downPaymentAmount = contractAmountMinPV;
    }
  } else if (manualDownPayment > 0) {
    if (manualDownPayment > objectCost) {
      downPaymentAmount = contractAmountMinPV;
    } else if (manualDownPayment < contractAmountMinPV) {
      downPaymentAmount = contractAmountMinPV;
    } else {
      downPaymentAmount = manualDownPayment;
    }
  } else if (userDownPaymentPercent > minDownPaymentPercent) {
    downPaymentAmount = downPaymentFromContract;
  } else if (downPayment >= contractAmountMinPV) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = contractAmountMinPV;
  }

  return Math.ceil(downPaymentAmount);
};
