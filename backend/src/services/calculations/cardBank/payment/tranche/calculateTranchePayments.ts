// backend/src/services/calculations/bankProgram/steps/payment/tranche/calculateTranchePayments.ts

import { Offer } from "../../../../../entities/Offer";
import { TranchePaymentsResult } from "../../../../../types/types";
import {
  getTrancheSecondDate,
  getMonthsUntilTranche,
} from "../../../../../utils/tranche/trancheDates";
import { calculateMonthlyPayment } from "../calculateMonthlyPayment";

export const calculateTranchePayments = (
  annualRate: number,
  offer: Offer,
  firstTrancheAmount: number,
  secondTrancheAmount: number,
  mortgageAmount: number,
  loanTermMonths: number,
): TranchePaymentsResult => {
  const monthlyRate = annualRate / 100 / 12;

  const secondDate = getTrancheSecondDate(offer); // ✅ Передаём offer
  const monthsFromOffer = getMonthsUntilTranche(offer); // ✅ Передаём offer

  const monthsUntilSecondTranche =
    monthsFromOffer !== null ? monthsFromOffer : 12;

  const annuityPayment = calculateMonthlyPayment(
    firstTrancheAmount,
    annualRate,
    loanTermMonths,
  );

  let maxInterest = 0;
  let debt = firstTrancheAmount;

  for (let i = 0; i < monthsUntilSecondTranche && i < loanTermMonths; i++) {
    const interest = debt * monthlyRate;
    maxInterest = Math.max(maxInterest, interest);
    const principalPayment = annuityPayment - interest;
    debt = Math.max(0, debt - principalPayment);
  }

  const firstTranchePayment = Math.ceil(maxInterest);

  let remainingFirstTranche = firstTrancheAmount;
  for (let i = 0; i < monthsUntilSecondTranche && i < loanTermMonths; i++) {
    const interest = remainingFirstTranche * monthlyRate;
    const principalPayment = firstTranchePayment - interest;
    remainingFirstTranche = Math.max(
      0,
      remainingFirstTranche - principalPayment,
    );
  }

  const totalRemaining = remainingFirstTranche + secondTrancheAmount;
  const remainingMonths = Math.max(
    1,
    loanTermMonths - monthsUntilSecondTranche,
  );

  const paymentAfterSecondTranche = calculateMonthlyPayment(
    totalRemaining,
    annualRate,
    remainingMonths,
  );

  return {
    firstTranchePayment: Math.ceil(firstTranchePayment),
    secondTranchePayment: Math.ceil(paymentAfterSecondTranche),
    monthlyPayment: Math.ceil(firstTranchePayment),
    trancheSecondDate: secondDate,
    monthsUntilSecondTranche: monthsUntilSecondTranche,
  };
};
