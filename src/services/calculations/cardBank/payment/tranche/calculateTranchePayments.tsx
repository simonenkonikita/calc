// src/hooks/calculations/bankProgram/payment/tranche/calculateTranchePayments.ts

import { BankOffer, TranchePaymentsResult } from "../../../../../utils/types";
import { calculateMonthlyPayment } from "../calculateMonthlyPayment";
import {
  getMonthsUntilTranche,
  getTrancheSecondDate,
} from "../../../../../utils/tranche/trancheDates";

export const calculateTranchePayments = (
  annualRate: number,
  bankOffer: BankOffer,
  firstTrancheAmount: number,
  secondTrancheAmount: number,
  mortgageAmount: number,
  loanTermMonths: number,
  complexName: string,
): TranchePaymentsResult => {
  const monthlyRate = annualRate / 100 / 12;

  const secondDate = getTrancheSecondDate(complexName);
  // Получаем количество месяцев до второго транша из ЖК
  const monthsFromComplex = getMonthsUntilTranche(complexName);

  // Если траншевая недоступна для этого ЖК, используем дефолт 12 месяцев
  const monthsUntilSecondTranche =
    monthsFromComplex !== null ? monthsFromComplex : 12;

  // Аннуитетный платеж для первого транша
  const annuityPayment = calculateMonthlyPayment(
    firstTrancheAmount,
    annualRate,
    loanTermMonths,
  );

  // Находим МАКСИМАЛЬНЫЙ процент за период до выдачи второго транша
  let maxInterest = 0;
  let debt = firstTrancheAmount;

  for (let i = 0; i < monthsUntilSecondTranche && i < loanTermMonths; i++) {
    const interest = debt * monthlyRate;
    maxInterest = Math.max(maxInterest, interest);
    const principalPayment = annuityPayment - interest;
    debt = Math.max(0, debt - principalPayment);
  }

  // Платеж по первому траншу = максимальный процент
  const firstTranchePayment = Math.ceil(maxInterest);

  // Пересчет остатка с новым платежом
  let remainingFirstTranche = firstTrancheAmount;
  for (let i = 0; i < monthsUntilSecondTranche && i < loanTermMonths; i++) {
    const interest = remainingFirstTranche * monthlyRate;
    const principalPayment = firstTranchePayment - interest;
    remainingFirstTranche = Math.max(
      0,
      remainingFirstTranche - principalPayment,
    );
  }

  // Платеж после выдачи второго транша
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
